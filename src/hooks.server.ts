import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
    const { user } = validateSession(event.request);
    event.locals.user = user;

    // Protect /events routes by default
    if (event.url.pathname.startsWith('/events') && !user) {
        return new Response('Unauthorized', { status: 401 });
    }

    return resolve(event);
};
