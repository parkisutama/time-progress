import { describe, expect, it } from 'vitest';
import { applySecurityHeaders } from './hooks.server';

describe('applySecurityHeaders', () => {
	it('adds browser hardening headers', () => {
		const response = applySecurityHeaders(new Response('ok'));

		expect(response.headers.get('x-content-type-options')).toBe('nosniff');
		expect(response.headers.get('x-frame-options')).toBe('DENY');
		expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
		expect(response.headers.get('permissions-policy')).toContain('camera=()');
		expect(response.headers.get('strict-transport-security')).toContain('max-age=31536000');
	});
});
