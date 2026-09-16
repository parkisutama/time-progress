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

export const EventListSchema = v.pipe(v.array(EventSchema), v.maxLength(500));

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

export function parseEventList(input: unknown): EventItem[] {
	const result = v.safeParse(EventListSchema, input);
	return result.success ? result.output : [];
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
