import { DateTime } from 'luxon';
import { type Readable, writable } from 'svelte/store';
import * as v from 'valibot';
import { parseEventList } from './event-schema';

export type { EventItem } from './event-schema';

import type { EventItem } from './event-schema';

const EVENTS_KEY = 'tp:events:v1';
const PENDING_KEY = 'tp:events:pending:v1';

const PendingIdsSchema = v.array(v.pipe(v.string(), v.uuid()));

type EventsStorage = Pick<Storage, 'getItem' | 'setItem'>;

export type EventsStoreOptions = {
	fetch: typeof fetch;
	/** Browser storage for the local event list; omitted during server rendering. */
	storage?: EventsStorage;
	/** Loads events from the server when the store is created. */
	syncOnCreate?: boolean;
};

export const eventsStore = createEventsStore({
	fetch: (input, init) => fetch(input, init),
	storage: typeof localStorage === 'undefined' ? undefined : localStorage,
	syncOnCreate: typeof window !== 'undefined'
});

/**
 * Local-first event list. A change is kept locally and its event id stays pending until the
 * server acknowledges it with a 2xx response, so server rejections never discard it (SPEC-001).
 */
export function createEventsStore(options: EventsStoreOptions) {
	const { storage } = options;
	let list = readEvents();
	const pendingIds = new Set(readPendingIds());
	const events = writable<EventItem[]>(list);
	const pending = writable<ReadonlySet<string>>(new Set(pendingIds));

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

	function send(id: string, method: 'POST' | 'PATCH' | 'DELETE', body: unknown) {
		options
			.fetch('/events', {
				method,
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body)
			})
			.then(
				(response) => {
					if (response.ok) setPending(id, false);
				},
				() => {
					// Offline: the change stays pending.
				}
			);
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
		try {
			const response = await options.fetch('/events');
			if (!response.ok) return;
			const server = parseEventList(await response.json());
			if (server) setList(merge(server));
		} catch {
			// Offline: keep the local list.
		}
	}

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
			setList([item, ...list]);
			setPending(item.id, true);
			send(item.id, 'POST', item);
			return item;
		},
		updateItem(id: string, patch: Partial<EventItem>) {
			const now = DateTime.now().toISO();
			setList(list.map((it) => (it.id === id ? { ...it, ...patch, updatedAt: now } : it)));
			setPending(id, true);
			send(id, 'PATCH', { id, ...patch });
		},
		remove(id: string) {
			setList(list.filter((it) => it.id !== id));
			setPending(id, true);
			send(id, 'DELETE', { id });
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
