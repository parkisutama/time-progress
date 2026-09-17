import * as v from 'valibot';

const EventIdSchema = v.pipe(v.string(), v.uuid());
const EventNameSchema = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(200));
const EventDetailSchema = v.pipe(v.string(), v.maxLength(2_000));
const TimestampSchema = v.pipe(v.string(), v.isoTimestamp());

export const EventSchema = v.pipe(
	v.strictObject({
		id: EventIdSchema,
		name: EventNameSchema,
		detail: v.optional(EventDetailSchema),
		start: TimestampSchema,
		end: TimestampSchema,
		createdAt: TimestampSchema,
		updatedAt: TimestampSchema
	}),
	v.check((event) => Date.parse(event.end) > Date.parse(event.start), 'End must be after start')
);

// The limit applies when an event is created, never when stored data is read (ADR-003).
export const EVENT_LIMIT = 500;

export const EventListSchema = v.array(EventSchema);

export const CreateEventSchema = v.pipe(
	v.strictObject({
		id: v.optional(EventIdSchema),
		name: EventNameSchema,
		detail: v.optional(EventDetailSchema),
		start: TimestampSchema,
		end: TimestampSchema,
		createdAt: v.optional(TimestampSchema),
		updatedAt: v.optional(TimestampSchema)
	}),
	v.check((event) => Date.parse(event.end) > Date.parse(event.start), 'End must be after start')
);

export const UpdateEventSchema = v.strictObject({
	id: EventIdSchema,
	name: v.optional(EventNameSchema),
	detail: v.optional(EventDetailSchema),
	start: v.optional(TimestampSchema),
	end: v.optional(TimestampSchema)
});

export const DeleteEventSchema = v.strictObject({ id: EventIdSchema });

export type EventItem = v.InferOutput<typeof EventSchema>;

/**
 * Returns the stored list unchanged when every record is valid, or `null` when it is not.
 * The input is returned instead of the parsed output so that transforms such as trimming never
 * rewrite records that a request does not target.
 */
export function parseEventList(input: unknown): EventItem[] | null {
	return v.is(EventListSchema, input) ? input : null;
}

export function applyEventPatch(
	event: EventItem,
	patch: v.InferOutput<typeof UpdateEventSchema>,
	updatedAt: string
): EventItem | null {
	const { id: _id, ...changes } = patch;
	const result = v.safeParse(EventSchema, { ...event, ...changes, updatedAt });
	return result.success ? result.output : null;
}
