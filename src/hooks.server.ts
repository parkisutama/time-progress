import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

const SECURITY_HEADERS = {
	'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY'
} as const;

export function applySecurityHeaders(response: Response): Response {
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(name, value);
	}
	return response;
}

export const handle: Handle = async ({ event, resolve }) => {
	const env = (event.platform as unknown as { env?: Record<string, unknown> })?.env;
	const { user } = validateSession(event.request, env);
	event.locals.user = user;

	// Protect /events routes by default
	if (event.url.pathname.startsWith('/events') && !user) {
		return applySecurityHeaders(new Response('Unauthorized', { status: 401 }));
	}

	return applySecurityHeaders(await resolve(event));
};
