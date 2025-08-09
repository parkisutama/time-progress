<script lang="ts">
	import Header from '../components/Header.svelte';
	import Quote from '../components/Quote.svelte';
	import Progress from '../components/Progress.svelte';
	import { timeData } from '$lib/stores';

	const progressOrder = ['week', 'month', 'quarter', 'year'];
</script>

<main class="dashboard rounded-xl bg-gray-100 shadow-lg">
	<div>
		<div>
			<section>
				<Header />
			</section>
			<div class="px-4 py-4">
				{#each progressOrder as period}
					<section class="mb-4 bg-white">
						<Progress
							title={$timeData.progress[period].title}
							periodProgress={$timeData.progress[period]}
							showWeekNumber={period === 'week'}
						/>
					</section>
				{/each}
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
