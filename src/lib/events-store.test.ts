import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EventItem } from './event-schema';
import { createEventsStore } from './events';

const EVENTS_KEY = 'tp:events:v1';
const PENDING_KEY = 'tp:events:pending:v1';

function event(index: number, name = `Event ${index}`): EventItem {
	return {
		id: `00000000-0000-4000-8000-${index.toString().padStart(12, '0')}`,
		name,
		detail: '',
		start: '2026-09-17T08:00:00.000Z',
		end: '2026-09-17T09:00:00.000Z',
		createdAt: '2026-09-16T07:00:00.000Z',
		updatedAt: '2026-09-16T07:00:00.000Z'
	};
}

function memoryStorage(initial: Record<string, unknown> = {}) {
	const values = new Map(
		Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)])
	);
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => {
			values.set(key, value);
		},
		read: (key: string): unknown => JSON.parse(values.get(key) ?? 'null')
	};
}

type Reply = number | 'network error' | { status: number; body: unknown };
type Call = { method: string; body: unknown };

/** A scripted `/events` endpoint: `reply` decides the response for each request. */
function fakeServer(reply: (method: string, body: unknown) => Reply | Promise<Reply>) {
	const calls: Call[] = [];
	const fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
		const method = init?.method ?? 'GET';
		const body = init?.body ? JSON.parse(String(init.body)) : undefined;
		calls.push({ method, body });
		const result = await reply(method, body);
		if (result === 'network error') throw new TypeError('Failed to fetch');
		const { status, body: responseBody } =
			typeof result === 'number' ? { status: result, body: undefined } : result;
		return new Response(responseBody === undefined ? null : JSON.stringify(responseBody), {
			status
		});
	}) as unknown as typeof globalThis.fetch;
	return { fetch, calls };
}

function openStore(
	storage: ReturnType<typeof memoryStorage>,
	server: ReturnType<typeof fakeServer>,
	onOnline?: (listener: () => void) => void
) {
	return createEventsStore({ fetch: server.fetch, storage, onOnline });
}

function writes(server: ReturnType<typeof fakeServer>) {
	return server.calls.filter((call) => call.method !== 'GET');
}

function deferred() {
	let resolve: (reply: Reply) => void = () => {};
	const promise = new Promise<Reply>((done) => {
		resolve = done;
	});
	return { promise, resolve };
}

function pendingIds(storage: ReturnType<typeof memoryStorage>) {
	return storage.read(PENDING_KEY) ?? [];
}

describe('SPEC-001 event synchronization', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date('2026-09-17T12:00:00.000Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const failures: [string, Reply][] = [
		['a network error', 'network error'],
		['401', 401],
		['422', 422],
		['500', 500]
	];

	const changes = [
		{
			name: 'create',
			apply: (store: ReturnType<typeof openStore>) =>
				store.add({ name: 'Created offline', start: event(1).start, end: event(1).end }).id,
			expectLocal: (list: EventItem[], id: string) =>
				expect(list.find((item) => item.id === id)?.name).toBe('Created offline')
		},
		{
			name: 'update',
			apply: (store: ReturnType<typeof openStore>) => {
				store.updateItem(event(0).id, { name: 'Renamed offline' });
				return event(0).id;
			},
			expectLocal: (list: EventItem[], id: string) =>
				expect(list.find((item) => item.id === id)?.name).toBe('Renamed offline')
		},
		{
			name: 'delete',
			apply: (store: ReturnType<typeof openStore>) => {
				store.remove(event(0).id);
				return event(0).id;
			},
			expectLocal: (list: EventItem[], id: string) =>
				expect(list.some((item) => item.id === id)).toBe(false)
		}
	];

	describe.each(failures)('when a change fails with %s', (_failure, failure) => {
		it.each(changes)(
			'AC-10: keeps a $name after a reload and marks it pending',
			async ({ apply, expectLocal }) => {
				const storage = memoryStorage({ [EVENTS_KEY]: [event(0)] });
				const offline = fakeServer(() => failure);
				const id = apply(openStore(storage, offline));
				await vi.waitFor(() => expect(offline.calls).toHaveLength(1));
				const reloaded = fakeServer((method) =>
					method === 'GET' ? { status: 200, body: [event(0)] } : failure
				);

				const store = openStore(storage, reloaded);
				await store.load();

				expectLocal(get(store), id);
				expect(pendingIds(storage)).toContain(id);
			}
		);
	});

	it.each([
		['500', 500 as Reply],
		['a network error', 'network error' as Reply]
	])('AC-11: keeps the local list when GET /events fails with %s', async (_case, failure) => {
		const local = [event(0), event(1)];
		const storage = memoryStorage({ [EVENTS_KEY]: local });
		const store = openStore(
			storage,
			fakeServer(() => failure)
		);

		await store.load();

		expect(get(store)).toEqual(local);
		expect(storage.read(EVENTS_KEY)).toEqual(local);
	});

	it('AC-12: clears the pending state when a later change is acknowledged', async () => {
		const storage = memoryStorage({ [EVENTS_KEY]: [event(0)], [PENDING_KEY]: [event(0).id] });
		const server = fakeServer((method) => (method === 'PATCH' ? 200 : 500));
		const store = openStore(storage, server);

		store.updateItem(event(0).id, { name: 'Renamed' });
		await vi.waitFor(() => expect(pendingIds(storage)).toEqual([]));

		expect(get(store.pending).has(event(0).id)).toBe(false);
	});

	it('AC-13: keeps all 501 events returned by the server', async () => {
		const serverEvents = Array.from({ length: 501 }, (_, index) => event(index));
		const storage = memoryStorage();
		const store = openStore(
			storage,
			fakeServer(() => ({ status: 200, body: serverEvents }))
		);

		await store.load();

		expect(get(store)).toHaveLength(501);
		expect(storage.read(EVENTS_KEY)).toHaveLength(501);
	});

	it('replaces events that are not pending with the server version', async () => {
		const storage = memoryStorage({
			[EVENTS_KEY]: [event(0, 'Stale'), event(1, 'Local edit')],
			[PENDING_KEY]: [event(1).id]
		});
		const server = fakeServer((method) =>
			method === 'GET'
				? { status: 200, body: [event(0, 'Fresh'), event(1, 'Server'), event(2)] }
				: 500
		);
		const store = openStore(storage, server);

		await store.load();

		expect(get(store).map((item) => item.name)).toEqual(['Fresh', 'Local edit', 'Event 2']);
	});
});

describe('SPEC-001 automatic retry', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date('2026-09-17T12:00:00.000Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('AC-14: stores a pending created event before requesting GET /events', async () => {
		const created = event(0);
		const storage = memoryStorage({ [EVENTS_KEY]: [created], [PENDING_KEY]: [created.id] });
		const server = fakeServer((method) => {
			if (method === 'PATCH') return 404;
			if (method === 'POST') return 200;
			return { status: 200, body: [created] };
		});
		const store = openStore(storage, server);

		await store.load();

		expect(server.calls.map((call) => call.method)).toEqual(['PATCH', 'POST', 'GET']);
		expect(pendingIds(storage)).toEqual([]);
	});

	it('AC-15: creates a pending event with POST when PATCH responds 404', async () => {
		const local = event(0, 'Never stored');
		const storage = memoryStorage({ [EVENTS_KEY]: [local], [PENDING_KEY]: [local.id] });
		const server = fakeServer((method) =>
			method === 'PATCH' ? 404 : method === 'POST' ? 200 : 500
		);
		const store = openStore(storage, server);

		await store.load();

		expect(writes(server)).toEqual([
			{
				method: 'PATCH',
				body: { id: local.id, name: local.name, detail: '', start: local.start, end: local.end }
			},
			{ method: 'POST', body: local }
		]);
		expect(pendingIds(storage)).toEqual([]);
	});

	it('AC-16: acknowledges a pending deletion when DELETE responds 404', async () => {
		const id = event(0).id;
		const storage = memoryStorage({ [EVENTS_KEY]: [], [PENDING_KEY]: [id] });
		const server = fakeServer((method) => (method === 'DELETE' ? 404 : 500));
		const store = openStore(storage, server);

		await store.load();

		expect(writes(server)).toEqual([{ method: 'DELETE', body: { id } }]);
		expect(pendingIds(storage)).toEqual([]);
	});

	it.each([
		['5 seconds', 5_000, 2],
		['30 more seconds', 35_000, 3],
		['2 more minutes', 155_000, 4],
		['10 more minutes', 755_000, 5],
		['another 10 minutes', 1_355_000, 6]
	])('AC-17: retries after %s following repeated network errors', async (_case, at, attempts) => {
		vi.useFakeTimers();
		const storage = memoryStorage({ [EVENTS_KEY]: [], [PENDING_KEY]: [event(0).id] });
		const server = fakeServer((method) => (method === 'DELETE' ? 'network error' : 500));
		await openStore(storage, server).load();
		await vi.advanceTimersByTimeAsync(at - 1);
		const before = writes(server).length;

		await vi.advanceTimersByTimeAsync(1);

		expect(before).toBe(attempts - 1);
		expect(writes(server)).toHaveLength(attempts);
	});

	it.each([401, 409, 422])('AC-18: stops retrying after a %s response', async (status) => {
		vi.useFakeTimers();
		const local = event(0);
		const storage = memoryStorage({ [EVENTS_KEY]: [local], [PENDING_KEY]: [local.id] });
		const server = fakeServer((method) => {
			if (method === 'PATCH') return status === 409 ? 404 : status;
			if (method === 'POST') return status;
			return 500;
		});
		await openStore(storage, server).load();
		const attempted = writes(server).length;

		await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

		expect(writes(server)).toHaveLength(attempted);
		expect(pendingIds(storage)).toEqual([local.id]);
	});

	it('AC-19: retries a pending event immediately when the browser comes online', async () => {
		const local = event(0);
		const storage = memoryStorage({ [EVENTS_KEY]: [local], [PENDING_KEY]: [local.id] });
		let accepting = false;
		const server = fakeServer((method) => (method === 'PATCH' ? (accepting ? 200 : 422) : 500));
		const listeners: (() => void)[] = [];
		await openStore(storage, server, (listener) => listeners.push(listener)).load();
		accepting = true;

		for (const listener of listeners) listener();

		await vi.waitFor(() => expect(pendingIds(storage)).toEqual([]));
		expect(writes(server)).toHaveLength(2);
	});

	it('AC-20: keeps an event pending until a change made during a request is acknowledged', async () => {
		const storage = memoryStorage({ [EVENTS_KEY]: [event(0)] });
		const first = deferred();
		const second = deferred();
		const replies = [first.promise, second.promise];
		const server = fakeServer((method) => (method === 'PATCH' ? (replies.shift() ?? 500) : 500));
		const store = openStore(storage, server);
		store.updateItem(event(0).id, { name: 'First' });
		await vi.waitFor(() => expect(writes(server)).toHaveLength(1));
		store.updateItem(event(0).id, { name: 'Second' });
		const whileInFlight = writes(server).length;

		first.resolve(200);

		await vi.waitFor(() => expect(writes(server)).toHaveLength(2));
		expect(whileInFlight).toBe(1);
		expect(writes(server)[1].body).toMatchObject({ name: 'Second' });
		expect(pendingIds(storage)).toEqual([event(0).id]);
	});
});
