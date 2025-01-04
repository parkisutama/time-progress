<script lang="ts">
	import { timeData } from '../lib/stores';
	import { onMount } from 'svelte';

	// Reactive store subscription for the quarter's progress
	let quarterProgress = $timeData.progress.quarter;

	// Animation state for the progress bar
	let progressWidth = 0;

	// Set progressWidth on mount
	onMount(() => {
		progressWidth = quarterProgress.progressPercentage;
	});

	// Reactively update progressWidth whenever quarterProgress.progressPercentage changes
	$: if (progressWidth !== quarterProgress.progressPercentage) {
		progressWidth = quarterProgress.progressPercentage;
	}
</script>

<div class="quarter-progress rounded-md bg-white px-4 py-4 shadow-md">
	<div class="relative mt-2">
		<div class="grid-cols-2">
			<div class="text-left text-sm text-gray-600">
				[Q{quarterProgress.start.toFormat('q')}]
				{quarterProgress.start.toFormat('dd MMMM yyyy')} - {quarterProgress.end.toFormat(
					'dd MMMM yyyy'
				)}
			</div>
			<!-- Percentage (Top Right) -->
			<div class="py-2 text-right text-sm font-medium text-gray-800">
				{quarterProgress.progressPercentage}%
			</div>
		</div>
		<!-- Progress Bar -->
		<div class="h-4 w-full rounded bg-gray-300">
			<div
				class="progress-bar h-4 rounded bg-gray-600 transition-all duration-1000 ease-in-out"
				style="--dynamic-width: {progressWidth}%;"
			></div>
		</div>

		<!-- Textual Info -->
		<p class="textual-info mt-2 text-sm text-gray-600">
			{quarterProgress.passedDays} d, {quarterProgress.remainingDays} d remaining ({quarterProgress.passedHours}/{quarterProgress.remainingHours}
			h)
		</p>
	</div>
</div>

<style>
	.quarter-progress {
		background: inherit; /* Inherit the background from the parent */
	}

	.progress-bar {
		width: 0%; /* Start at 0% */
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
