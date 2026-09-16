import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { eventProgress, getEventStatus } from './events';

const start = DateTime.fromISO('2026-09-17T08:00:00.000Z');
const end = DateTime.fromISO('2026-09-17T10:00:00.000Z');

describe('event timing', () => {
	it('classifies upcoming, active, and complete events', () => {
		expect(getEventStatus(start.minus({ seconds: 1 }), start, end)).toBe('upcoming');
		expect(getEventStatus(start.plus({ hours: 1 }), start, end)).toBe('active');
		expect(getEventStatus(end.plus({ seconds: 1 }), start, end)).toBe('complete');
	});

	it('clamps progress to the event range', () => {
		expect(eventProgress(start.minus({ hours: 1 }), start, end).pct).toBe(0);
		expect(eventProgress(start.plus({ hours: 1 }), start, end).pct).toBe(50);
		expect(eventProgress(end.plus({ hours: 1 }), start, end).pct).toBe(100);
	});
});
