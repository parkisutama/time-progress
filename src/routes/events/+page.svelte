<script lang="ts">
	import type { EventItem } from '$lib/events';
	import { eventsStore } from '$lib/events';
	import EventCard from '../../components/EventCard.svelte';
	import EventFormModal from '../../components/EventFormModal.svelte';

	const events = $derived($eventsStore);

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
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-xl font-semibold">My Events</h1>
		<button class="rounded bg-gray-800 px-3 py-2 text-white" onclick={openCreate}>New Event</button>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each events as e}
			<EventCard {e} on:edit={() => openEdit(e)} on:view={() => openView(e)} />
		{/each}
	</div>
</section>

{#if showModal}
	<EventFormModal {editing} {readonly} on:close={() => (showModal = false)} />
{/if}
