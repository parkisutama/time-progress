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
				<section class="bg-white py-2">
					<WeekProgress />
				</section>
				<section class="bg-white py-2">
					<MonthProgress />
				</section>
				<section class="bg-white py-2">
					<QuarterProgress />
				</section>
				<section class="bg-white py-2">
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
