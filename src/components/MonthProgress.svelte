<script lang="ts">
	import { timeData } from '../lib/stores';
	import { onMount } from 'svelte';

	// Reactive store subscription for the month's progress
	let monthProgress = $timeData.progress.month;

	// Animation state for the progress bar
	let progressWidth = 0;

	// Set progressWidth on mount
	onMount(() => {
		progressWidth = monthProgress.progressPercentage;
	});

	// Reactively update progressWidth whenever monthProgress.progressPercentage changes
	$: if (progressWidth !== monthProgress.progressPercentage) {
		progressWidth = monthProgress.progressPercentage;
	}
</script>

<div class="month-progress px-4 py-2">
	<p class="text-sm text-gray-600">
		{monthProgress.start.toFormat('dd MMMM yyyy')} - {monthProgress.end.toFormat('dd MMMM yyyy')}
	</p>
	<div class="relative mt-2">
		<!-- Progress Bar -->
		<div class="h-4 w-full rounded bg-gray-300">
			<div
				class="progress-bar h-4 rounded bg-gray-600 transition-all duration-1000 ease-in-out"
				style="--dynamic-width: {progressWidth}%;"
			></div>
		</div>
		<!-- Percentage (Bottom Right) -->
		<span class="absolute bottom-0 right-0 text-sm font-medium text-gray-800">
			{monthProgress.progressPercentage}%
		</span>
		<!-- Textual Info -->
		<p class="textual-info mt-2 text-sm text-gray-600">
			month: {monthProgress.passedDays} days, {monthProgress.remainingDays} days remaining ({monthProgress.passedHours}/{monthProgress.remainingHours}
			hours)
		</p>
	</div>
</div>

<style>
	.month-progress {
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
