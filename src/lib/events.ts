import { DateTime } from 'luxon';
import { writable } from 'svelte/store';
import { parseEventList } from './event-schema';

export type { EventItem } from './event-schema';

import type { EventItem } from './event-schema';

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

export function createEventsStore(options: EventsStoreOptions) {
	const key = 'tp:events:v1';
	const initial: EventItem[] = [];
	const { storage } = options;
	const { subscribe, set, update } = writable<EventItem[]>(load());

	function load(): EventItem[] {
		if (!storage) return initial;
		try {
			const raw = storage.getItem(key);
			return raw ? (parseEventList(JSON.parse(raw)) ?? initial) : initial;
		} catch {
			return initial;
		}
	}

	function persist(value: EventItem[]) {
		storage?.setItem(key, JSON.stringify(value));
	}

	async function syncFromServer() {
		try {
			const res = await options.fetch('/events');
			if (res.ok) {
				const items = parseEventList(await res.json()) ?? [];
				set(items);
				persist(items);
			}
		} catch {
			// ignore (offline)
		}
	}

	// try initial sync (if authorized server returns 401, we stay local)
	if (options.syncOnCreate) {
		syncFromServer();
	}

	return {
		subscribe,
		add(e: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>) {
			const now = DateTime.now().toISO();
			const item: EventItem = { id: crypto.randomUUID(), ...e, createdAt: now, updatedAt: now };
			update((list) => {
				const next = [item, ...list];
				persist(next);
				return next;
			});
			// try server
			options
				.fetch('/events', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(item)
				})
				.catch(() => {});
			return item;
		},
		updateItem(id: string, patch: Partial<EventItem>) {
			const now = DateTime.now().toISO();
			update((list) => {
				const next = list.map((it) => (it.id === id ? { ...it, ...patch, updatedAt: now } : it));
				persist(next);
				return next;
			});
			options
				.fetch('/events', {
					method: 'PATCH',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ id, ...patch })
				})
				.catch(() => {});
		},
		remove(id: string) {
			update((list) => {
				const next = list.filter((it) => it.id !== id);
				persist(next);
				return next;
			});
			options
				.fetch('/events', {
					method: 'DELETE',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ id })
				})
				.catch(() => {});
		},
		setAll(items: EventItem[]) {
			const validated = parseEventList(items) ?? [];
			set(validated);
			persist(validated);
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
