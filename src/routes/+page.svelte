<script>
	import Header from '../components/Header.svelte';
	import Quote from '../components/Quote.svelte';
	import TodayProgress from '../components/TodayProgress.svelte';
	import WeekProgress from '../components/WeekProgress.svelte';
	import MonthProgress from '../components/MonthProgress.svelte';
	import QuarterProgress from '../components/QuarterProgress.svelte';
	import YearProgress from '../components/YearProgress.svelte';
</script>

<main class="dashboard bg-white shadow-lg">
	<div>
		<div>
			<section>
				<Header />
			</section>
			<div class="px-4 py-4">
				<section class="rounded-lg px-4 py-4 shadow-sm">
					<WeekProgress />
				</section>
				<section class="rounded-lg px-4 py-4 shadow-sm">
					<MonthProgress />
				</section>
				<section class="rounded-lg px-4 py-4 shadow-sm">
					<QuarterProgress />
				</section>
				<section class="rounded-lg px-4 py-4 shadow-sm">
					<YearProgress />
				</section>
				<section class="rounded-lg px-4 py-4 shadow-sm">
					<Quote />
				</section>
			</div>
		</div>
	</div>
</main>

<style>
	@media (max-width: 640px) {
	}
</style>
