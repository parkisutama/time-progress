<script lang="ts">
	import { timeData } from '../lib/stores';
	import { onMount } from 'svelte';

	// Reactive store subscription for the week's progress
	let weekProgress = $timeData.progress.week;

	// Animation state for the progress bar
	let progressWidth = 0;

	// Set progressWidth on mount
	onMount(() => {
		progressWidth = weekProgress.progressPercentage;
	});

	// Reactively update progressWidth whenever weekProgress.progressPercentage changes
	$: if (progressWidth !== weekProgress.progressPercentage) {
		progressWidth = weekProgress.progressPercentage;
	}
</script>

<div class="week-progress rounded-md bg-white px-4 py-4 shadow-md">
	<div class="relative mt-2">
		<div class="grid-cols-2">
			<div class="text-left text-sm text-gray-600">
				[Week {weekProgress.start.toFormat('WW')}]
				{weekProgress.start.toFormat('dd MMMM yyyy')} - {weekProgress.end.toFormat('dd MMMM yyyy')}
			</div>
			<!-- Percentage (Bottom Right) -->
			<div class="py-2 text-right text-sm font-medium text-gray-800">
				{weekProgress.progressPercentage}%
			</div>
		</div>
		<!-- Progress Bar -->
		<div class="h-4 w-full rounded bg-gray-300">
			<div
				class="progress-bar h-4 rounded bg-gray-600"
				style="--dynamic-width: {progressWidth}%;"
			></div>
		</div>

		<!-- Textual Info -->
		<p class="textual-info mt-2 text-sm text-gray-600">
			{weekProgress.passedDays} d, {weekProgress.remainingDays}
			d remaining ({weekProgress.passedHours}/{weekProgress.remainingHours} h)
		</p>
	</div>
</div>

<style>
	.week-progress {
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
