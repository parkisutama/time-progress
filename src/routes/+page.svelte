<script>
	import Header from '../components/Header.svelte';
	import Quote from '../components/Quote.svelte';
	import WeekProgress from '../components/WeekProgress.svelte';
	import MonthProgress from '../components/MonthProgress.svelte';
	import QuarterProgress from '../components/QuarterProgress.svelte';
	import YearProgress from '../components/YearProgress.svelte';
</script>

<main class="dashboard rounded-xl bg-gray-100 shadow-lg">
	<div>
		<div>
			<section>
				<Header />
			</section>
			<div class="px-4 py-4">
				<section class="mb-4 bg-white">
					<WeekProgress />
				</section>
				<section class="mb-4 bg-white">
					<MonthProgress />
				</section>
				<section class=" mb-4 bg-white">
					<QuarterProgress />
				</section>
				<section class="mb-4 bg-white">
					<YearProgress />
				</section>
				<section class="shadow-dm rounded-lg px-4 py-4">
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
