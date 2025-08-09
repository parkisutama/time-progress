import type { RequestHandler } from '@sveltejs/kit';

type EventItem = {
    id: string;
    name: string;
    detail?: string;
    start: string; // ISO
    end: string; // ISO
    createdAt: string; // ISO
    updatedAt: string; // ISO
};

function keyFor(email: string) {
    return `events:${email}`;
}

type Env = { EVENTS: { get: (k: string) => Promise<string | null>; put: (k: string, v: string) => Promise<void> } };

async function getList(env: Env | undefined, email: string): Promise<EventItem[]> {
    const raw = await env?.EVENTS?.get(keyFor(email));
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as EventItem[];
        if (Array.isArray(parsed)) return parsed;
        return [];
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
    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();
    const item: EventItem = {
        id: body?.id ?? crypto.randomUUID(),
        name: body?.name ?? 'Untitled',
        detail: body?.detail ?? '',
        start: body?.start ?? now,
        end: body?.end ?? now,
        createdAt: body?.createdAt ?? now,
        updatedAt: body?.updatedAt ?? now
    };
    const list = await getList(env, locals.user.email);
    const next = [item, ...list];
    await setList(env, locals.user.email, next);
    return new Response(JSON.stringify(item), { headers: { 'content-type': 'application/json' } });
};

export const PATCH: RequestHandler = async ({ request, locals, platform }) => {
    if (!locals.user) return new Response('Unauthorized', { status: 401 });
    const env = (platform as unknown as { env?: Env })?.env;
    const body = await request.json().catch(() => ({}));
    const { id, ...patch } = body ?? {};
    if (!id) return new Response('Missing id', { status: 400 });
    const list = await getList(env, locals.user.email);
    const now = new Date().toISOString();
    const next = list.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: now } : e));
    await setList(env, locals.user.email, next);
    const updated = next.find((e) => e.id === id);
    return new Response(JSON.stringify(updated), { headers: { 'content-type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ request, locals, platform }) => {
    if (!locals.user) return new Response('Unauthorized', { status: 401 });
    const env = (platform as unknown as { env?: Env })?.env;
    const body = await request.json().catch(() => ({}));
    const { id } = body ?? {};
    if (!id) return new Response('Missing id', { status: 400 });
    const list = await getList(env, locals.user.email);
    const next = list.filter((e) => e.id !== id);
    await setList(env, locals.user.email, next);
    return new Response('OK');
};
