import type { RequestEvent } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, PATCH, POST } from './+server';

const email = 'user@example.com';
const storageKey = `events:${email}`;

type StoredRecord = Record<string, unknown> & { id: string };

function fakeKv(initial: Record<string, string> = {}) {
	const values = new Map(Object.entries(initial));
	return {
		get: async (key: string) => values.get(key) ?? null,
		put: async (key: string, value: string) => {
			values.set(key, value);
		},
		raw: (key: string) => values.get(key) ?? null
	};
}

type FakeKv = ReturnType<typeof fakeKv>;

function storedEvent(index: number): StoredRecord {
	return {
		id: `00000000-0000-4000-8000-${index.toString().padStart(12, '0')}`,
		name: `Event ${index}`,
		detail: '',
		start: '2026-09-17T08:00:00.000Z',
		end: '2026-09-17T09:00:00.000Z',
		createdAt: '2026-09-16T07:00:00.000Z',
		updatedAt: '2026-09-16T07:00:00.000Z'
	};
}

function storedEvents(count: number): StoredRecord[] {
	return Array.from({ length: count }, (_, index) => storedEvent(index));
}

const newEvent = {
	id: 'dc174a5a-d72d-44ae-b96f-c274f02d5ea1',
	name: 'Release review',
	start: '2026-09-18T08:00:00.000Z',
	end: '2026-09-18T09:00:00.000Z'
};

const handlers = { GET, POST, PATCH, DELETE };

const writeBodies = {
	POST: newEvent,
	PATCH: { id: storedEvent(0).id, name: 'Renamed' },
	DELETE: { id: storedEvent(0).id }
};

type Method = keyof typeof handlers;
type WriteMethod = keyof typeof writeBodies;

const writeMethods = Object.keys(writeBodies) as WriteMethod[];

function send(method: Method, events: FakeKv | null, body?: unknown) {
	const request = new Request('https://progressive-time.example/events', {
		method,
		headers: { 'content-type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body)
	});
	const event = {
		request,
		locals: { user: { email }, session: null },
		platform: { env: events ? { EVENTS: events } : {} }
	} as unknown as RequestEvent;

	return handlers[method](event);
}

function storedRecords(events: FakeKv): StoredRecord[] {
	return JSON.parse(events.raw(storageKey) ?? '[]') as StoredRecord[];
}

function withoutId(records: StoredRecord[], id: string) {
	return records.filter((record) => record.id !== id);
}

describe('SPEC-001 /events persistence integrity', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date('2026-09-17T12:00:00.000Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('AC-1: refuses a new event and keeps all 501 stored events', async () => {
		const original = JSON.stringify(storedEvents(501));
		const events = fakeKv({ [storageKey]: original });

		const response = await send('POST', events, newEvent);

		expect(response.status).toBe(409);
		expect(events.raw(storageKey)).toBe(original);
	});

	it('AC-2: stores the 500th event with all 499 existing events', async () => {
		const original = storedEvents(499);
		const events = fakeKv({ [storageKey]: JSON.stringify(original) });

		const response = await send('POST', events, newEvent);

		expect(response.status).toBe(200);
		expect(storedRecords(events)).toHaveLength(500);
		expect(withoutId(storedRecords(events), newEvent.id)).toEqual(original);
	});

	it('AC-3: renames one of 501 stored events and keeps the other 500', async () => {
		const original = storedEvents(501);
		const target = original[0].id;
		const events = fakeKv({ [storageKey]: JSON.stringify(original) });

		const response = await send('PATCH', events, { id: target, name: 'Renamed' });

		expect(response.status).toBe(200);
		expect(storedRecords(events).find((record) => record.id === target)?.name).toBe('Renamed');
		expect(withoutId(storedRecords(events), target)).toEqual(withoutId(original, target));
	});

	it('AC-4: deletes one of 501 stored events and keeps the other 500', async () => {
		const original = storedEvents(501);
		const target = original[0].id;
		const events = fakeKv({ [storageKey]: JSON.stringify(original) });

		const response = await send('DELETE', events, { id: target });

		expect(response.status).toBe(200);
		expect(storedRecords(events)).toEqual(withoutId(original, target));
	});

	it.each(writeMethods)(
		'AC-5: responds 500 to %s and keeps malformed stored JSON',
		async (method) => {
			const original = `${JSON.stringify(storedEvents(3)).slice(0, -1)},{"id":`;
			const events = fakeKv({ [storageKey]: original });

			const response = await send(method, events, writeBodies[method]);

			expect(response.status).toBe(500);
			expect(events.raw(storageKey)).toBe(original);
		}
	);

	it.each(writeMethods)(
		'AC-6: responds 500 to %s and keeps a stored invalid record',
		async (method) => {
			const original = JSON.stringify([...storedEvents(3), { ...storedEvent(3), name: '' }]);
			const events = fakeKv({ [storageKey]: original });

			const response = await send(method, events, writeBodies[method]);

			expect(response.status).toBe(500);
			expect(events.raw(storageKey)).toBe(original);
		}
	);

	it.each([
		['malformed JSON', '[{"id":'],
		['an invalid record', JSON.stringify([{ ...storedEvent(0), end: 'not a timestamp' }])]
	])('AC-7: responds 500 to GET when stored data is %s', async (_case, raw) => {
		const events = fakeKv({ [storageKey]: raw });

		const response = await send('GET', events);

		expect(response.status).toBe(500);
	});

	it('AC-8: returns all 501 stored events', async () => {
		const original = storedEvents(501);
		const events = fakeKv({ [storageKey]: JSON.stringify(original) });

		const response = await send('GET', events);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual(original);
	});

	it.each([
		['GET', undefined],
		['POST', writeBodies.POST],
		['PATCH', writeBodies.PATCH],
		['DELETE', writeBodies.DELETE]
	] as [Method, unknown][])(
		'AC-9: responds 500 to %s without the EVENTS binding',
		async (method, body) => {
			const response = await send(method, null, body);

			expect(response.status).toBe(500);
		}
	);

	it('returns an empty list when nothing is stored', async () => {
		const events = fakeKv();

		const response = await send('GET', events);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([]);
	});

	it('keeps untargeted stored names exactly as stored when another event changes', async () => {
		const original = [storedEvent(0), { ...storedEvent(1), name: '  Padded name  ' }];
		const events = fakeKv({ [storageKey]: JSON.stringify(original) });

		await send('PATCH', events, { id: original[0].id, name: 'Renamed' });

		expect(storedRecords(events)[1]).toEqual(original[1]);
	});

	it('validates the request body before reading unreadable stored data', async () => {
		const events = fakeKv({ [storageKey]: '[{"id":' });

		const response = await send('POST', events, { name: '' });

		expect(response.status).toBe(422);
	});
});
