<script lang="ts">
	import type { EventItem } from '$lib/events';
	import { eventsStore } from '$lib/events';
	import { createEventDispatcher } from 'svelte';
	import { DateTime } from 'luxon';

	const { editing, readonly = false } = $props<{ editing: EventItem | null; readonly?: boolean }>();
	const dispatch = createEventDispatcher<{ close: void }>();

	let name = $state(editing?.name ?? '');
	let detail = $state(editing?.detail ?? '');
	let start = $state(editing?.start ?? DateTime.now().toISO());
	let end = $state(editing?.end ?? DateTime.now().plus({ hours: 1 }).toISO());
	const idName = 'evt-name';
	const idDetail = 'evt-detail';
	const idStart = 'evt-start';
	const idEnd = 'evt-end';

	function close() {
		dispatch('close');
	}
	function save() {
		if (editing) {
			eventsStore.updateItem(editing.id, { name, detail, start, end });
		} else {
			eventsStore.add({ name, detail, start, end });
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
					<label class="mb-1 block text-sm" for={idStart}>Start (ISO)</label>
					<input
						id={idStart}
						class="w-full rounded border px-3 py-2"
						bind:value={start}
						disabled={readonly}
					/>
				</div>
				<div>
					<label class="mb-1 block text-sm" for={idEnd}>End (ISO)</label>
					<input
						id={idEnd}
						class="w-full rounded border px-3 py-2"
						bind:value={end}
						disabled={readonly}
					/>
				</div>
			</div>
		</div>
		<div class="mt-4 flex justify-end gap-2">
			<button class="rounded border px-3 py-2" onclick={close}>Close</button>
			{#if !readonly}
				<button class="rounded bg-gray-800 px-3 py-2 text-white" onclick={save}>Save</button>
			{/if}
		</div>
	</div>
</div>
