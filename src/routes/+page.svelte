<script lang="ts">
	import Header from '../components/Header.svelte';
	import Quote from '../components/Quote.svelte';
	import WeekProgress from '../components/WeekProgress.svelte';
	import MonthProgress from '../components/MonthProgress.svelte';
	import QuarterProgress from '../components/QuarterProgress.svelte';
	import YearProgress from '../components/YearProgress.svelte';
	import EventCard from '../components/EventCard.svelte';
	import EventFormModal from '../components/EventFormModal.svelte';
	import { eventsStore } from '../lib/events';
	import { DateTime } from 'luxon';
	import type { EventItem } from '../lib/events';

	// Runes
	const events = $derived($eventsStore);

	// ticking clock to refresh active filter (every 60s is enough)
	let now = $state(DateTime.now());
	$effect(() => {
		const id = setInterval(() => (now = DateTime.now()), 60_000);
		return () => clearInterval(id);
	});

	// Filter active (now between start and end) and sort by urgency: shortest remaining, then soonest start
	const activeEvents = $derived(
		events
			.filter((e) => {
				const s = DateTime.fromISO(e.start);
				const en = DateTime.fromISO(e.end);
				return now >= s && now <= en;
			})
			.sort((a, b) => {
				const sa = DateTime.fromISO(a.start);
				const ea = DateTime.fromISO(a.end);
				const sb = DateTime.fromISO(b.start);
				const eb = DateTime.fromISO(b.end);
				const ra = Math.max(0, ea.diff(now, 'seconds').seconds);
				const rb = Math.max(0, eb.diff(now, 'seconds').seconds);
				if (ra !== rb) return ra - rb; // shorter remaining first
				return sa.toMillis() - sb.toMillis(); // earlier start first
			})
	);

	let sliderEl: HTMLElement | undefined;
	let headerEl: HTMLElement | undefined;

	// quick-create modal from homepage
	let showModal = $state(false);
	let editing: EventItem | null = $state(null);
	let modalReadonly = $state(false);

	// responsive scroll step based on card width
	let scrollStep = $state(260);
	let hasPrev = $state(false);
	let hasNext = $state(false);
	let headerHeight = $state<number | null>(null);
	let isDesktop = $state(false);

	function updateArrows() {
		if (!sliderEl) return;
		const { scrollLeft, scrollWidth, clientWidth } = sliderEl;
		hasPrev = scrollLeft > 2;
		hasNext = scrollLeft + clientWidth < scrollWidth - 2;
	}

	$effect(() => {
		if (!sliderEl) return;
		const update = () => {
			const first = sliderEl?.querySelector(':scope > div') as HTMLElement | null;
			if (first) scrollStep = first.offsetWidth + 16; // + gap-4 (16px)
			updateArrows();
		};
		update();
		const ro = new ResizeObserver(update);
		ro.observe(sliderEl);
		sliderEl.addEventListener('scroll', updateArrows, { passive: true });
		return () => {
			ro.disconnect();
			sliderEl?.removeEventListener('scroll', updateArrows);
		};
	});

	// track header height to match card height (desktop only)
	$effect(() => {
		if (!headerEl) return;
		const set = () => (headerHeight = headerEl?.offsetHeight ?? null);
		set();
		const ro = new ResizeObserver(set);
		ro.observe(headerEl);
		return () => ro.disconnect();
	});

	// watch viewport for desktop breakpoint (sm: 640px)
	$effect(() => {
		if (typeof window === 'undefined') return;
		const mql = window.matchMedia('(min-width: 640px)');
		const set = () => (isDesktop = mql.matches);
		set();
		mql.addEventListener('change', set);
		return () => mql.removeEventListener('change', set);
	});

	function prev() {
		sliderEl?.scrollBy({ left: -scrollStep, behavior: 'smooth' });
	}
	function next() {
		sliderEl?.scrollBy({ left: scrollStep, behavior: 'smooth' });
	}
</script>

<main class="min-h-screen overflow-x-hidden bg-gray-50">
	<!-- Header + slider in one row -->
	<section class="px-4 py-6">
		<div class="mx-auto max-w-6xl">
			<!-- Toolbar: moves controls out of the slider so they don't cover cards -->
			<div class="mb-3 flex items-center justify-end gap-2">
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
				<a
					href="/events"
					title="All events"
					aria-label="All events"
					class="flex h-9 w-9 items-center justify-center rounded border bg-white p-0 shadow-sm"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-5 w-5 text-gray-700"
						><path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" /></svg
					>
				</a>
				<button
					title="New event"
					aria-label="New event"
					class="flex h-9 w-9 items-center justify-center rounded border bg-white p-0 shadow-sm"
					onclick={() => {
						editing = null;
						modalReadonly = false;
						showModal = true;
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-5 w-5 text-gray-700"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" /></svg
					>
				</button>
				{#if hasPrev}
					<button
						class="flex h-9 w-9 items-center justify-center rounded border bg-white p-0 text-base leading-none shadow-sm"
						aria-label="Previous"
						onclick={prev}>‹</button
					>
				{/if}
				{#if hasNext}
					<button
						class="flex h-9 w-9 items-center justify-center rounded border bg-white p-0 text-base leading-none shadow-sm"
						aria-label="Next"
						onclick={next}>›</button
					>
				{/if}
			</div>
			<div class="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start">
				<div class="w-full flex-shrink-0 sm:max-w-[340px]" bind:this={headerEl}>
					<Header />
				</div>
				<div class="relative min-w-0 flex-1">
					<div
						bind:this={sliderEl}
						class="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pr-8 pb-1 sm:pr-12"
						style="scrollbar-width: none;"
					>
						{#if activeEvents.length === 0}
							<div class="text-sm text-gray-500">No active events</div>
						{:else}
							{#each activeEvents as e}
								<div
									class="max-w-[85vw] min-w-[80vw] snap-start sm:max-w-[280px] sm:min-w-[260px]"
									style={isDesktop && headerHeight ? `height:${headerHeight}px` : ''}
								>
									<EventCard
										{e}
										on:view={() => {
											editing = e;
											modalReadonly = true;
											showModal = true;
										}}
										on:edit={() => {
											editing = e;
											modalReadonly = false;
											showModal = true;
										}}
									/>
								</div>
							{/each}
						{/if}
					</div>
					{#if showModal}
						<EventFormModal
							{editing}
							readonly={modalReadonly}
							on:close={() => (showModal = false)}
						/>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- Events gallery slider (active events) -->

	<!-- New 4-column responsive grid for periodical progress -->
	<section class="px-4 pb-6">
		<div class="mx-auto max-w-6xl">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<WeekProgress />
				<MonthProgress />
				<QuarterProgress />
				<YearProgress />
			</div>
		</div>
	</section>

	<!-- Quote section -->
	<section class="px-4 pb-10">
		<div class="mx-auto max-w-6xl">
			<div class="rounded-lg bg-white p-4 shadow-md">
				<Quote />
			</div>
		</div>
	</section>
</main>

<style>
	@media (max-width: 640px) {
	}
</style>
