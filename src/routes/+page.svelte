<script>
	import Header from '../components/Header.svelte';
	import Quote from '../components/Quote.svelte';
	import TodayProgress from '../components/TodayProgress.svelte';
	import WeekProgress from '../components/WeekProgress.svelte';
	import MonthProgress from '../components/MonthProgress.svelte';
	import QuarterProgress from '../components/QuarterProgress.svelte';
	import YearProgress from '../components/YearProgress.svelte';
</script>

<main class="dashboard mx-8 my-8 bg-gray-200 px-8 shadow-lg">
	<div class="widget">
		<section class="widget">
			<Quote />
		</section>
		<Header></Header>
	</div>
	<div class="rounded-md bg-white px-2 py-8 shadow-md">
		<section>
			<TodayProgress />
		</section>
		<section>
			<WeekProgress />
			<section>
				<MonthProgress />
			</section>
			<section>
				<QuarterProgress />
			</section>
			<section>
				<YearProgress />
			</section>
		</section>
	</div>
</main>

<style>
	@media (max-width: 640px) {
		.dashboard {
			padding: 1rem;
		}

		.widget {
			align-items: flex-start;
		}
	}
</style>
