// Minimal auth helper for Cloudflare Access on Workers/SvelteKit
// Reads the email from the CF header set by Cloudflare Access after successful login.

export type SessionValidationResult = {
	user: { email: string } | null;
	session: null;
};

function isLocalRequest(request: Request): boolean {
	const { hostname } = new URL(request.url);
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

export function validateSession(
	request: Request,
	env?: Record<string, unknown>
): SessionValidationResult {
	// Cloudflare Access adds this header for authenticated requests
	const email = request.headers.get('Cf-Access-Authenticated-User-Email');

	// Local-only escape hatch. Configure it in an ignored `.dev.vars` file, never in production.
	const devBypass = (env?.DEV_BYPASS_EMAIL as string | undefined) ?? undefined;

	if (email && email.length > 0) {
		return { user: { email }, session: null };
	}

	if (devBypass && isLocalRequest(request)) {
		return { user: { email: devBypass }, session: null };
	}

	return { user: null, session: null };
}
