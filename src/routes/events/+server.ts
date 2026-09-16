import type { RequestHandler } from '@sveltejs/kit';
import * as v from 'valibot';
import {
	applyEventPatch,
	CreateEventSchema,
	DeleteEventSchema,
	type EventItem,
	parseEventList,
	UpdateEventSchema
} from '$lib/event-schema';

function keyFor(email: string) {
	return `events:${email}`;
}

type Env = {
	EVENTS: {
		get: (k: string) => Promise<string | null>;
		put: (k: string, v: string) => Promise<void>;
	};
};

async function getList(env: Env | undefined, email: string): Promise<EventItem[]> {
	const raw = await env?.EVENTS?.get(keyFor(email));
	if (!raw) return [];
	try {
		return parseEventList(JSON.parse(raw));
	} catch {
		return [];
	}
}

async function setList(env: Env | undefined, email: string, list: EventItem[]) {
	if (!env?.EVENTS) throw new Error('KV binding EVENTS is not configured');
	await env.EVENTS.put(keyFor(email), JSON.stringify(list));
}

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const env = (platform as unknown as { env?: Env })?.env;
	const list = await getList(env, locals.user.email);
	return new Response(JSON.stringify(list), { headers: { 'content-type': 'application/json' } });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const env = (platform as unknown as { env?: Env })?.env;
	const parsed = v.safeParse(CreateEventSchema, await request.json().catch(() => null));
	if (!parsed.success) return new Response('Invalid event', { status: 422 });
	const body = parsed.output;
	const now = new Date().toISOString();
	const item: EventItem = {
		id: body?.id ?? crypto.randomUUID(),
		name: body?.name ?? 'Untitled',
		detail: body?.detail ?? '',
		start: body?.start ?? now,
		end: body?.end ?? now,
		createdAt: now,
		updatedAt: now
	};
	const list = await getList(env, locals.user.email);
	if (list.some((event) => event.id === item.id)) {
		return new Response('Event already exists', { status: 409 });
	}
	const next = [item, ...list];
	await setList(env, locals.user.email, next);
	return new Response(JSON.stringify(item), { headers: { 'content-type': 'application/json' } });
};

export const PATCH: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const env = (platform as unknown as { env?: Env })?.env;
	const parsed = v.safeParse(UpdateEventSchema, await request.json().catch(() => null));
	if (!parsed.success) return new Response('Invalid event update', { status: 422 });
	const patch = parsed.output;
	const list = await getList(env, locals.user.email);
	const now = new Date().toISOString();
	const current = list.find((event) => event.id === patch.id);
	if (!current) return new Response('Event not found', { status: 404 });
	const updated = applyEventPatch(current, patch, now);
	if (!updated) return new Response('Invalid event update', { status: 422 });
	const next = list.map((event) => (event.id === patch.id ? updated : event));
	await setList(env, locals.user.email, next);
	return new Response(JSON.stringify(updated), { headers: { 'content-type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const env = (platform as unknown as { env?: Env })?.env;
	const parsed = v.safeParse(DeleteEventSchema, await request.json().catch(() => null));
	if (!parsed.success) return new Response('Invalid event id', { status: 422 });
	const { id } = parsed.output;
	const list = await getList(env, locals.user.email);
	if (!list.some((event) => event.id === id))
		return new Response('Event not found', { status: 404 });
	const next = list.filter((e) => e.id !== id);
	await setList(env, locals.user.email, next);
	return new Response('OK');
};
