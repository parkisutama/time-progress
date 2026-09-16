import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import { CreateEventSchema } from './event-schema';

const validEvent = {
	name: 'Release review',
	detail: 'Review the production release',
	start: '2026-09-17T08:00:00.000Z',
	end: '2026-09-17T09:00:00.000Z'
};

describe('CreateEventSchema', () => {
	it('accepts a valid event', () => {
		expect(v.safeParse(CreateEventSchema, validEvent).success).toBe(true);
	});

	it('rejects an empty name', () => {
		expect(v.safeParse(CreateEventSchema, { ...validEvent, name: '  ' }).success).toBe(false);
	});

	it('rejects an end before the start', () => {
		const result = v.safeParse(CreateEventSchema, {
			...validEvent,
			end: '2026-09-17T07:00:00.000Z'
		});

		expect(result.success).toBe(false);
	});

	it('rejects unknown fields', () => {
		expect(v.safeParse(CreateEventSchema, { ...validEvent, admin: true }).success).toBe(false);
	});
});
