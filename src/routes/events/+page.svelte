<script lang="ts">
	import type { EventItem } from '$lib/events';
	import { eventsStore } from '$lib/events';
	import EventCard from '../../components/EventCard.svelte';
	import EventFormModal from '../../components/EventFormModal.svelte';
	import { DateTime } from 'luxon';

	const events = $derived($eventsStore);

	// ticker to keep urgency sort fresh
	let now = $state(DateTime.now());
	$effect(() => {
		const id = setInterval(() => (now = DateTime.now()), 60_000);
		return () => clearInterval(id);
	});

	function statusWeight(e: EventItem) {
		const s = DateTime.fromISO(e.start);
		const en = DateTime.fromISO(e.end);
		if (now >= s && now <= en) return 0; // active
		if (now < s) return 1; // upcoming
		return 2; // complete
	}

	const sortedEvents = $derived(
		[...events].sort((a, b) => {
			const wa = statusWeight(a);
			const wb = statusWeight(b);
			if (wa !== wb) return wa - wb;
			const sa = DateTime.fromISO(a.start);
			const ea = DateTime.fromISO(a.end);
			const sb = DateTime.fromISO(b.start);
			const eb = DateTime.fromISO(b.end);
			if (wa === 0) {
				// both active: shorter remaining first, then earlier start
				const ra = Math.max(0, ea.diff(now, 'seconds').seconds);
				const rb = Math.max(0, eb.diff(now, 'seconds').seconds);
				if (ra !== rb) return ra - rb;
				return sa.toMillis() - sb.toMillis();
			}
			if (wa === 1) {
				// both upcoming: earlier start first
				return sa.toMillis() - sb.toMillis();
			}
			// both complete: most recently ended first
			return DateTime.fromISO(b.end).toMillis() - DateTime.fromISO(a.end).toMillis();
		})
	);

	let showModal = $state(false);
	let editing: EventItem | null = $state(null);
	let readonly = $state(false);

	function openCreate() {
		editing = null;
		readonly = false;
		showModal = true;
	}
	function openEdit(item: EventItem) {
		editing = item;
		readonly = false;
		showModal = true;
	}
	function openView(item: EventItem) {
		editing = item;
		readonly = true;
		showModal = true;
	}
</script>

<section class="px-4 py-6">
	<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<a
				href="/"
				title="Home"
				aria-label="Home"
				class="flex h-9 w-9 items-center justify-center rounded border bg-white p-0 shadow-sm"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="h-5 w-5 text-gray-700"><path d="M12 3 3 10h2v10h6V14h2v6h6V10h2L12 3Z" /></svg
				>
			</a>
			<h1 class="text-xl font-semibold">My Events</h1>
		</div>
		<button
			title="New event"
			aria-label="New event"
			class="flex h-9 w-9 items-center justify-center rounded border bg-white p-0 shadow-sm"
			onclick={openCreate}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="h-5 w-5 text-gray-700"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" /></svg
			>
		</button>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each sortedEvents as e}
			<EventCard {e} on:edit={() => openEdit(e)} on:view={() => openView(e)} />
		{/each}
	</div>
</section>

{#if showModal}
	<EventFormModal {editing} {readonly} on:close={() => (showModal = false)} />
{/if}
