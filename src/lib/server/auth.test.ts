import { describe, expect, it } from 'vitest';
import { validateSession } from './auth';

describe('validateSession', () => {
	it('accepts an identity provided by Cloudflare Access', () => {
		const request = new Request('https://progressive-time.example/events', {
			headers: { 'Cf-Access-Authenticated-User-Email': 'user@example.com' }
		});

		expect(validateSession(request).user).toEqual({ email: 'user@example.com' });
	});

	it('allows the development bypass on localhost', () => {
		const request = new Request('http://localhost:5173/events');

		expect(validateSession(request, { DEV_BYPASS_EMAIL: 'developer@example.com' }).user).toEqual({
			email: 'developer@example.com'
		});
	});

	it('rejects the development bypass on a deployed host', () => {
		const request = new Request('https://progressive-time.example/events');

		expect(validateSession(request, { DEV_BYPASS_EMAIL: 'developer@example.com' }).user).toBeNull();
	});
});
