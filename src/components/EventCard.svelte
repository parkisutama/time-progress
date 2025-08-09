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

<div class="flex h-full flex-col rounded-lg bg-white p-4 shadow-md">
	<div class="mb-2 flex items-start justify-between gap-2">
		<h2 class="text-base leading-tight font-semibold">{e.name}</h2>
		<span class="rounded bg-gray-100 px-2 py-0.5 text-[10px] tracking-wide text-gray-700 uppercase"
			>{status}</span
		>
	</div>

	<div class="mb-1 text-[11px] text-gray-500">
		<span class="font-medium text-gray-600">Start:</span>
		{start.toFormat('ff')}
	</div>
	<div class="mb-3 text-[11px] text-gray-500">
		<span class="font-medium text-gray-600">End:</span>
		{end.toFormat('ff')}
	</div>

	{#if e.detail}
		<p class="mb-3 line-clamp-3 text-sm text-gray-600">{e.detail}</p>
	{/if}

	{#if status === 'upcoming'}
		<div class="mb-3 text-center text-sm text-gray-700">
			Starts in
			<span class="ml-1 text-lg font-semibold"
				>{secondsToHMS(Math.max(0, start.diff(now, 'seconds').seconds))}</span
			>
		</div>
	{:else if status === 'active'}
		<div class="mb-2 flex items-center justify-between text-xs text-gray-700">
			<span class="font-medium">{prog.pct}%</span>
			<span>{secondsToHMS(prog.remaining)} left</span>
		</div>
		<div class="h-2 w-full rounded bg-gray-200">
			<div class="h-2 rounded bg-gray-700" style={`width:${prog.pct}%`}></div>
		</div>
	{:else}
		<div class="mb-3 text-center text-sm font-medium text-green-700">Complete</div>
	{/if}

	<div class="mt-auto flex items-center justify-end gap-1 pt-4">
		<!-- View -->
		<button
			class="rounded p-1.5 hover:bg-gray-100"
			title="View"
			aria-label="View"
			onclick={() => dispatch('view')}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="h-5 w-5 text-gray-700"
			>
				<path
					d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
				/>
			</svg>
			<span class="sr-only">View</span>
		</button>
		<!-- Edit -->
		<button
			class="rounded p-1.5 hover:bg-gray-100"
			title="Edit"
			aria-label="Edit"
			onclick={() => dispatch('edit')}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="h-5 w-5 text-gray-700"
			>
				<path
					d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm2.92 2.33h-.5v-.5l9.1-9.1.5.5-9.1 9.1ZM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"
				/>
			</svg>
			<span class="sr-only">Edit</span>
		</button>
		<!-- Delete -->
		<button
			class="rounded p-1.5 hover:bg-red-50"
			title="Delete"
			aria-label="Delete"
			onclick={() => eventsStore.remove(e.id)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="h-5 w-5 text-red-600"
			>
				<path d="M6 7h12v2H6V7Zm2 3h8l-1 9H9L8 10Zm3-5h2v2h-2V5Z" />
			</svg>
			<span class="sr-only">Delete</span>
		</button>
	</div>
</div>
