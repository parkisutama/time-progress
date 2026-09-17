import { DateTime } from 'luxon';
import { type Readable, writable } from 'svelte/store';
import * as v from 'valibot';
import { parseEventList } from './event-schema';

export type { EventItem } from './event-schema';

import type { EventItem } from './event-schema';

const EVENTS_KEY = 'tp:events:v1';
const PENDING_KEY = 'tp:events:pending:v1';

/** Delays before automatic retries after a network error or 5xx response; the last one repeats. */
const RETRY_DELAYS_MS = [5_000, 30_000, 120_000, 600_000];

const PendingIdsSchema = v.array(v.pipe(v.string(), v.uuid()));

type EventsStorage = Pick<Storage, 'getItem' | 'setItem'>;

type Outcome = 'acknowledged' | 'transient' | 'rejected';

export type EventsStoreOptions = {
	fetch: typeof fetch;
	/** Browser storage for the local event list; omitted during server rendering. */
	storage?: EventsStorage;
	/** Registers a listener for the browser `online` event. */
	onOnline?: (listener: () => void) => void;
	/** Retries pending changes and loads events from the server when the store is created. */
	syncOnCreate?: boolean;
};

export const eventsStore = createEventsStore({
	fetch: (input, init) => fetch(input, init),
	storage: typeof localStorage === 'undefined' ? undefined : localStorage,
	onOnline:
		typeof window === 'undefined'
			? undefined
			: (listener) => window.addEventListener('online', listener),
	syncOnCreate: typeof window !== 'undefined'
});

/**
 * Local-first event list. A change is kept locally and its event id stays pending until the
 * server acknowledges it with a 2xx response, so server rejections never discard it, and pending
 * changes are retried automatically (SPEC-001).
 */
export function createEventsStore(options: EventsStoreOptions) {
	const { storage } = options;
	let list = readEvents();
	const pendingIds = new Set(readPendingIds());
	const events = writable<EventItem[]>(list);
	const pending = writable<ReadonlySet<string>>(new Set(pendingIds));
	// Local change counter per event, so that a stale acknowledgement cannot clear a newer change.
	const revisions = new Map<string, number>();
	const inFlight = new Map<string, Promise<void>>();
	// Rejected events wait for a page load, an online event, or a local change (REQ-23).
	const blocked = new Set<string>();
	let retryStep = 0;
	let retryTimer: ReturnType<typeof setTimeout> | undefined;

	function readEvents(): EventItem[] {
		try {
			const raw = storage?.getItem(EVENTS_KEY);
			return raw ? (parseEventList(JSON.parse(raw)) ?? []) : [];
		} catch {
			return [];
		}
	}

	function readPendingIds(): string[] {
		try {
			const raw = storage?.getItem(PENDING_KEY);
			const parsed: unknown = raw ? JSON.parse(raw) : [];
			return v.is(PendingIdsSchema, parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

	function setList(next: EventItem[]) {
		list = next;
		events.set(next);
		storage?.setItem(EVENTS_KEY, JSON.stringify(next));
	}

	function setPending(id: string, isPending: boolean) {
		if (isPending) pendingIds.add(id);
		else pendingIds.delete(id);
		pending.set(new Set(pendingIds));
		storage?.setItem(PENDING_KEY, JSON.stringify([...pendingIds]));
	}

	function changeLocally(id: string, next: EventItem[]) {
		setList(next);
		setPending(id, true);
		blocked.delete(id);
		revisions.set(id, (revisions.get(id) ?? 0) + 1);
	}

	async function request(method: string, body: unknown): Promise<number | null> {
		try {
			const response = await options.fetch('/events', {
				method,
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body)
			});
			return response.status;
		} catch {
			return null;
		}
	}

	function classify(status: number | null): Outcome {
		if (status === null || status >= 500) return 'transient';
		if (status >= 200 && status < 300) return 'acknowledged';
		return 'rejected';
	}

	// Sends the current local state of one event (REQ-20).
	async function send(id: string, create: boolean): Promise<Outcome> {
		const item = list.find((event) => event.id === id);
		if (!item) {
			const status = await request('DELETE', { id });
			return status === 404 ? 'acknowledged' : classify(status);
		}
		if (!create) {
			const { name, detail, start, end } = item;
			const status = await request('PATCH', { id, name, detail, start, end });
			if (status !== 404) return classify(status);
		}
		return classify(await request('POST', item));
	}

	// One request per event at a time; a change made meanwhile is sent afterwards (REQ-24, REQ-25).
	function sync(id: string, create = false): Promise<void> {
		const running = inFlight.get(id);
		if (running) return running;
		const revision = revisions.get(id) ?? 0;
		const attempt = send(id, create).then((outcome) => {
			inFlight.delete(id);
			if ((revisions.get(id) ?? 0) !== revision) return sync(id);
			settle(id, outcome);
		});
		inFlight.set(id, attempt);
		return attempt;
	}

	function settle(id: string, outcome: Outcome) {
		if (outcome === 'acknowledged') {
			setPending(id, false);
			retryStep = 0;
		} else if (outcome === 'rejected') {
			blocked.add(id);
		} else {
			scheduleRetry();
		}
	}

	function scheduleRetry() {
		if (retryTimer !== undefined) return;
		const delay = RETRY_DELAYS_MS[Math.min(retryStep, RETRY_DELAYS_MS.length - 1)];
		retryStep += 1;
		retryTimer = setTimeout(() => {
			retryTimer = undefined;
			void retryPending();
		}, delay);
	}

	async function retryPending() {
		const ids = [...pendingIds].filter((id) => !blocked.has(id));
		await Promise.all(ids.map((id) => sync(id)));
	}

	// Pending events keep their local state, including pending deletions (REQ-14).
	function merge(server: EventItem[]): EventItem[] {
		const local = new Map(list.map((item) => [item.id, item]));
		const serverIds = new Set(server.map((item) => item.id));
		const unsynced = list.filter((item) => pendingIds.has(item.id) && !serverIds.has(item.id));
		const synced = server.flatMap((item) => {
			if (!pendingIds.has(item.id)) return [item];
			const localItem = local.get(item.id);
			return localItem ? [localItem] : [];
		});
		return [...unsynced, ...synced];
	}

	async function load() {
		await retryPending();
		try {
			const response = await options.fetch('/events');
			if (!response.ok) return;
			const server = parseEventList(await response.json());
			if (server) setList(merge(server));
		} catch {
			// Offline: keep the local list.
		}
	}

	options.onOnline?.(() => {
		blocked.clear();
		retryStep = 0;
		clearTimeout(retryTimer);
		retryTimer = undefined;
		void retryPending();
	});

	if (options.syncOnCreate) {
		void load();
	}

	return {
		subscribe: events.subscribe,
		/** Ids of events whose latest local change the server has not acknowledged. */
		pending: { subscribe: pending.subscribe } as Readable<ReadonlySet<string>>,
		load,
		add(e: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>) {
			const now = DateTime.now().toISO();
			const item: EventItem = { id: crypto.randomUUID(), ...e, createdAt: now, updatedAt: now };
			changeLocally(item.id, [item, ...list]);
			void sync(item.id, true);
			return item;
		},
		updateItem(id: string, patch: Partial<EventItem>) {
			const now = DateTime.now().toISO();
			changeLocally(
				id,
				list.map((it) => (it.id === id ? { ...it, ...patch, updatedAt: now } : it))
			);
			void sync(id);
		},
		remove(id: string) {
			changeLocally(
				id,
				list.filter((it) => it.id !== id)
			);
			void sync(id);
		},
		setAll(items: EventItem[]) {
			setList(parseEventList(items) ?? []);
		}
	};
}

export type EventStatus = 'upcoming' | 'active' | 'complete';

export function getEventStatus(now: DateTime, start: DateTime, end: DateTime): EventStatus {
	if (now < start) return 'upcoming';
	if (now > end) return 'complete';
	return 'active';
}

export function eventProgress(now: DateTime, start: DateTime, end: DateTime) {
	const total = end.diff(start, 'seconds').seconds;
	const elapsed = Math.max(0, Math.min(total, now.diff(start, 'seconds').seconds));
	const remaining = Math.max(0, total - elapsed);
	const pct = total === 0 ? 100 : Math.round((elapsed / total) * 100);
	return { total, elapsed, remaining, pct };
}
