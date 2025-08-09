<script lang="ts">
	import type { EventItem } from '$lib/events';
	import { eventsStore } from '$lib/events';
	import { createEventDispatcher } from 'svelte';
	import { DateTime } from 'luxon';

	const { editing, readonly = false } = $props<{ editing: EventItem | null; readonly?: boolean }>();
	const dispatch = createEventDispatcher<{ close: void }>();

	let name = $state(editing?.name ?? '');
	let detail = $state(editing?.detail ?? '');

	function isoToLocalInput(iso: string) {
		const dt = DateTime.fromISO(iso);
		return dt.isValid ? dt.toFormat("yyyy-LL-dd'T'HH:mm") : '';
	}
	function localInputToIso(localStr: string) {
		const dt = DateTime.fromISO(localStr);
		return dt.isValid ? dt.toISO() : '';
	}

	let startLocal = $state(isoToLocalInput(editing?.start ?? DateTime.now().toISO()));
	let endLocal = $state(isoToLocalInput(editing?.end ?? DateTime.now().plus({ hours: 1 }).toISO()));

	const zoneLabel = DateTime.now().toFormat('ZZZZ');

	const invalidReason = $derived(
		(() => {
			const s = DateTime.fromISO(startLocal);
			const e = DateTime.fromISO(endLocal);
			if (!s.isValid) return 'Invalid start date/time';
			if (!e.isValid) return 'Invalid end date/time';
			if (e <= s) return 'End must be after start';
			return '';
		})()
	);
	const idName = 'evt-name';
	const idDetail = 'evt-detail';
	const idStart = 'evt-start';
	const idEnd = 'evt-end';

	function close() {
		dispatch('close');
	}
	function save() {
		const startIso = localInputToIso(startLocal);
		const endIso = localInputToIso(endLocal);
		if (!startIso || !endIso || (invalidReason && invalidReason.length > 0)) return;
		if (editing) {
			eventsStore.updateItem(editing.id, { name, detail, start: startIso, end: endIso });
		} else {
			eventsStore.add({ name, detail, start: startIso, end: endIso });
		}
		close();
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
	<div class="w-full max-w-lg rounded-lg bg-white p-4 shadow-lg">
		<h3 class="mb-3 text-lg font-semibold">{editing ? 'Edit Event' : 'New Event'}</h3>
		<div class="space-y-3">
			<div>
				<label class="mb-1 block text-sm" for={idName}>Name</label>
				<input
					id={idName}
					class="w-full rounded border px-3 py-2"
					bind:value={name}
					disabled={readonly}
				/>
			</div>
			<div>
				<label class="mb-1 block text-sm" for={idDetail}>Detail</label>
				<textarea
					id={idDetail}
					class="w-full rounded border px-3 py-2"
					rows="3"
					bind:value={detail}
					disabled={readonly}
				></textarea>
			</div>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div>
					<label class="mb-1 block text-sm" for={idStart}>Start</label>
					<input
						id={idStart}
						type="datetime-local"
						class="w-full rounded border px-3 py-2"
						bind:value={startLocal}
						step="60"
						disabled={readonly}
					/>
					<div class="mt-1 text-[11px] text-gray-500">Time zone: {zoneLabel}</div>
				</div>
				<div>
					<label class="mb-1 block text-sm" for={idEnd}>End</label>
					<input
						id={idEnd}
						type="datetime-local"
						class="w-full rounded border px-3 py-2"
						bind:value={endLocal}
						step="60"
						min={startLocal}
						disabled={readonly}
					/>
					<div class="mt-1 text-[11px] text-gray-500">Time zone: {zoneLabel}</div>
				</div>
			</div>
			{#if invalidReason}
				<div class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{invalidReason}
				</div>
			{/if}
		</div>
		<div class="mt-4 flex justify-end gap-2">
			<button class="rounded border px-3 py-2" onclick={close}>Close</button>
			{#if !readonly}
				<button
					class="rounded bg-gray-800 px-3 py-2 text-white disabled:opacity-50"
					disabled={!!invalidReason}
					onclick={save}>Save</button
				>
			{/if}
		</div>
	</div>
</div>
