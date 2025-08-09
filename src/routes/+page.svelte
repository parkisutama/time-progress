<script>
	import Header from '../components/Header.svelte';
	import Quote from '../components/Quote.svelte';
	import WeekProgress from '../components/WeekProgress.svelte';
	import MonthProgress from '../components/MonthProgress.svelte';
	import QuarterProgress from '../components/QuarterProgress.svelte';
	import YearProgress from '../components/YearProgress.svelte';
</script>

<main class="min-h-screen bg-gray-50">
	<!-- Header stays as its own section -->
	<section class="px-4 py-6">
		<div class="mb-3 flex items-center justify-between">
			<Header />
			<a href="/events" class="rounded bg-gray-800 px-3 py-2 text-sm text-white">Events</a>
		</div>
	</section>

	<!-- New 4-column responsive grid for periodical progress -->
	<section class="px-4 pb-6">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<WeekProgress />
			<MonthProgress />
			<QuarterProgress />
			<YearProgress />
		</div>
	</section>

	<!-- Quote section -->
	<section class="px-4 pb-10">
		<div class="rounded-lg bg-white p-4 shadow-md">
			<Quote />
		</div>
	</section>
</main>

<style>
	@media (max-width: 640px) {
	}
</style>
