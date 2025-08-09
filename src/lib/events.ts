import { writable } from 'svelte/store';
import { DateTime } from 'luxon';

export type EventItem = {
    id: string;
    name: string;
    detail?: string;
    start: string; // ISO
    end: string;   // ISO
    createdAt: string; // ISO
    updatedAt: string; // ISO
};

export const eventsStore = createEventsStore();

function createEventsStore() {
    const key = 'tp:events:v1';
    const initial: EventItem[] = [];
    const { subscribe, set, update } = writable<EventItem[]>(load());

    function load(): EventItem[] {
        if (typeof localStorage === 'undefined') return initial;
        try {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as EventItem[]) : initial;
        } catch {
            return initial;
        }
    }

    function persist(value: EventItem[]) {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(value));
    }

    async function syncFromServer() {
        try {
            const res = await fetch('/events');
            if (res.ok) {
                const items = (await res.json()) as EventItem[];
                set(items);
                persist(items);
            }
        } catch {
            // ignore (offline)
        }
    }

    // try initial sync (if authorized server returns 401, we stay local)
    if (typeof window !== 'undefined') {
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
            fetch('/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(item) }).catch(() => { });
            return item;
        },
        updateItem(id: string, patch: Partial<EventItem>) {
            const now = DateTime.now().toISO();
            update((list) => {
                const next = list.map((it) => (it.id === id ? { ...it, ...patch, updatedAt: now } : it));
                persist(next);
                return next;
            });
            fetch('/events', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...patch }) }).catch(() => { });
        },
        remove(id: string) {
            update((list) => {
                const next = list.filter((it) => it.id !== id);
                persist(next);
                return next;
            });
            fetch('/events', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => { });
        },
        setAll(items: EventItem[]) {
            set(items);
            persist(items);
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
