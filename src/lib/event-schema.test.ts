import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import { applyEventPatch, CreateEventSchema, parseEventList } from './event-schema';

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

describe('stored event validation', () => {
	const storedEvent = {
		id: 'dc174a5a-d72d-44ae-b96f-c274f02d5ea1',
		...validEvent,
		createdAt: '2026-09-17T07:00:00.000Z',
		updatedAt: '2026-09-17T07:00:00.000Z'
	};

	it('rejects a malformed persisted list', () => {
		expect(parseEventList([{ ...storedEvent, name: '' }])).toEqual([]);
	});

	it('rejects a patch that creates an invalid event range', () => {
		expect(
			applyEventPatch(
				storedEvent,
				{ id: storedEvent.id, start: '2026-09-17T10:00:00.000Z' },
				'2026-09-17T07:30:00.000Z'
			)
		).toBeNull();
	});
});
