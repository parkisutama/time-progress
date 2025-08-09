<script lang="ts">
	import { DateTime, Duration } from 'luxon';
	import type { EventItem } from '$lib/events';
	import { getEventStatus, eventProgress, eventsStore } from '$lib/events';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ edit: void; view: void }>();

	const { e } = $props<{ e: EventItem }>();

	// Live time ticker
	let now = $state(DateTime.now());
	let timer: any;
	$effect(() => {
		timer = setInterval(() => (now = DateTime.now()), 1000);
		return () => clearInterval(timer);
	});

	const start = $derived(DateTime.fromISO(e.start));
	const end = $derived(DateTime.fromISO(e.end));
	const status = $derived(getEventStatus(now, start, end));
	const prog = $derived(eventProgress(now, start, end));

	function secondsToHMS(sec: number) {
		const d = Duration.fromObject({ seconds: sec }).shiftTo('hours', 'minutes', 'seconds');
		const h = Math.max(0, Math.floor(d.hours ?? 0));
		const m = Math.max(0, Math.floor(d.minutes ?? 0));
		const s = Math.max(0, Math.floor(d.seconds ?? 0));
		return `${h}h ${m}m ${s}s`;
	}
</script>

<div class="rounded-lg bg-white p-4 shadow-md">
	<div class="mb-1 text-xs text-gray-500">{start.toFormat('ff')} – {end.toFormat('ff')}</div>
	<div class="mb-1 flex items-start justify-between gap-2">
		<h2 class="text-lg font-semibold">{e.name}</h2>
		<span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{status}</span>
	</div>
	{#if e.detail}
		<p class="mb-3 line-clamp-3 text-sm text-gray-600">{e.detail}</p>
	{/if}

	{#if status === 'upcoming'}
		<div class="text-sm text-gray-700">Starts in {secondsToHMS(prog.remaining)}</div>
	{:else if status === 'active'}
		<div class="mb-2 flex items-center justify-between text-sm text-gray-700">
			<span>{prog.pct}%</span>
			<span>{secondsToHMS(prog.remaining)} left</span>
		</div>
		<div class="h-3 w-full rounded bg-gray-200">
			<div class="h-3 rounded bg-gray-700" style={`width:${prog.pct}%`}></div>
		</div>
	{:else}
		<div class="text-sm font-medium text-green-700">Complete</div>
	{/if}

	<div class="mt-4 flex gap-2">
		<button class="rounded border px-2 py-1" onclick={() => dispatch('view')}>View</button>
		<button class="rounded border px-2 py-1" onclick={() => dispatch('edit')}>Edit</button>
		<button class="rounded border px-2 py-1" onclick={() => eventsStore.remove(e.id)}>Delete</button
		>
	</div>
</div>
