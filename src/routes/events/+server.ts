import type { RequestHandler } from '@sveltejs/kit';
import * as v from 'valibot';
import {
	applyEventPatch,
	CreateEventSchema,
	DeleteEventSchema,
	EVENT_LIMIT,
	type EventItem,
	parseEventList,
	UpdateEventSchema
} from '$lib/event-schema';

function keyFor(email: string) {
	return `events:${email}`;
}

type EventStorage = {
	get: (k: string) => Promise<string | null>;
	put: (k: string, v: string) => Promise<void>;
};

type Platform = { env?: { EVENTS?: EventStorage } };

type StoredList =
	| { ok: true; storage: EventStorage; list: EventItem[] }
	| { ok: false; response: Response };

// Unreadable stored data blocks every request so that it is never overwritten (ADR-003, SPEC-001).
async function readList(platform: unknown, email: string): Promise<StoredList> {
	const storage = (platform as Platform | undefined)?.env?.EVENTS;
	if (!storage) {
		return {
			ok: false,
			response: new Response('Event storage is not configured', { status: 500 })
		};
	}
	const raw = await storage.get(keyFor(email));
	if (raw === null) return { ok: true, storage, list: [] };
	let list: EventItem[] | null = null;
	try {
		list = parseEventList(JSON.parse(raw));
	} catch {
		// Malformed JSON is unreadable, like a list with an invalid record.
	}
	if (!list) {
		return { ok: false, response: new Response('Stored events cannot be read', { status: 500 }) };
	}
	return { ok: true, storage, list };
}

async function writeList(storage: EventStorage, email: string, list: EventItem[]) {
	await storage.put(keyFor(email), JSON.stringify(list));
}

function json(body: unknown) {
	return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
}

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const stored = await readList(platform, locals.user.email);
	if (!stored.ok) return stored.response;
	return json(stored.list);
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const parsed = v.safeParse(CreateEventSchema, await request.json().catch(() => null));
	if (!parsed.success) return new Response('Invalid event', { status: 422 });
	const stored = await readList(platform, locals.user.email);
	if (!stored.ok) return stored.response;
	const { storage, list } = stored;
	if (list.length >= EVENT_LIMIT) {
		return new Response('Event limit reached', { status: 409 });
	}
	const body = parsed.output;
	const now = new Date().toISOString();
	const item: EventItem = {
		id: body.id ?? crypto.randomUUID(),
		name: body.name,
		detail: body.detail ?? '',
		start: body.start,
		end: body.end,
		createdAt: now,
		updatedAt: now
	};
	if (list.some((event) => event.id === item.id)) {
		return new Response('Event already exists', { status: 409 });
	}
	await writeList(storage, locals.user.email, [item, ...list]);
	return json(item);
};

export const PATCH: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const parsed = v.safeParse(UpdateEventSchema, await request.json().catch(() => null));
	if (!parsed.success) return new Response('Invalid event update', { status: 422 });
	const patch = parsed.output;
	const stored = await readList(platform, locals.user.email);
	if (!stored.ok) return stored.response;
	const { storage, list } = stored;
	const current = list.find((event) => event.id === patch.id);
	if (!current) return new Response('Event not found', { status: 404 });
	const updated = applyEventPatch(current, patch, new Date().toISOString());
	if (!updated) return new Response('Invalid event update', { status: 422 });
	const next = list.map((event) => (event.id === patch.id ? updated : event));
	await writeList(storage, locals.user.email, next);
	return json(updated);
};

export const DELETE: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const parsed = v.safeParse(DeleteEventSchema, await request.json().catch(() => null));
	if (!parsed.success) return new Response('Invalid event id', { status: 422 });
	const { id } = parsed.output;
	const stored = await readList(platform, locals.user.email);
	if (!stored.ok) return stored.response;
	const { storage, list } = stored;
	if (!list.some((event) => event.id === id)) {
		return new Response('Event not found', { status: 404 });
	}
	await writeList(
		storage,
		locals.user.email,
		list.filter((event) => event.id !== id)
	);
	return new Response('OK');
};
