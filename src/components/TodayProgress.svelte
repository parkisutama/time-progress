<script lang="ts">
	import { timeData } from '../lib/stores';

	// Today's progress (Svelte 5 runes)
	const todayProgress = $derived($timeData.progress.day);

	// Animation state for the progress bar
	let progressWidth = $state(0);

	$effect(() => {
		progressWidth = todayProgress.progressPercentage;
	});
</script>

<div class="today-progress px-4 py-2">
	<!-- <h2 class="text-xl font-bold text-gray-600">Today's Progress</h2> -->
	<div class="relative mt-2">
		<!-- Progress Bar -->
		<div class="h-4 w-full rounded bg-gray-300">
			<div
				class="progress-bar h-4 rounded bg-gray-600"
				style="--dynamic-width: {progressWidth}%"
			></div>
		</div>
		<div>
			<!-- Percentage (Bottom Right) -->
			<span class="absolute right-0 text-sm font-medium text-gray-800">
				{todayProgress.progressPercentage}%
			</span>
			<!-- Textual Info -->
			<p class="textual-info mt-2 text-sm text-gray-600">
				today: {todayProgress.passedHours} hours, {todayProgress.remainingHours} hours remaining
			</p>
		</div>
	</div>
</div>

<style>
	.today-progress {
		background: inherit; /* Inherit the background from the parent */
	}
	.progress-bar {
		width: 0%;
		animation: fill 1s ease-in-out forwards;
	}

	.textual-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 1rem;
	}

	/* Define the keyframes */
	@keyframes fill {
		from {
			width: 0%;
		}
		to {
			width: var(--dynamic-width);
		}
	}
</style>
