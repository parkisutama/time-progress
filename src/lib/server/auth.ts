// Minimal auth helper for Cloudflare Access on Workers/SvelteKit
// Reads the email from the CF header set by Cloudflare Access after successful login.

export type SessionValidationResult = {
    user: { email: string } | null;
    session: null;
};

export function validateSession(request: Request, env?: Record<string, unknown>): SessionValidationResult {
    // Cloudflare Access adds this header for authenticated requests
    const email = request.headers.get('Cf-Access-Authenticated-User-Email');

    // Dev bypass (useful for local preview): set DEV_BYPASS_EMAIL in wrangler.toml [vars]
    const devBypass = (env?.DEV_BYPASS_EMAIL as string | undefined) ?? undefined;

    if (email && email.length > 0) {
        return { user: { email }, session: null };
    }

    if (devBypass) {
        return { user: { email: devBypass }, session: null };
    }

    return { user: null, session: null };
}
