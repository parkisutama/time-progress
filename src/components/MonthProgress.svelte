<script lang="ts">
	import { timeData } from '../lib/stores';

	// Monthly progress (Svelte 5 runes)
	const monthProgress = $derived($timeData.progress.month);

	// Animation state for the progress bar
	let progressWidth = $state(0);

	$effect(() => {
		progressWidth = monthProgress.progressPercentage;
	});
</script>

<div class="month-progress rounded-md bg-white px-4 py-4 shadow-md">
	<div class="relative mt-2">
		<div class="grid-cols-2">
			<div class="text-left text-sm text-gray-600">
				{monthProgress.start.toFormat('dd MMMM yyyy')} - {monthProgress.end.toFormat(
					'dd MMMM yyyy'
				)}
			</div>
			<!-- Percentage (Top Right) -->
			<div class="py-2 text-right text-sm font-medium text-gray-800">
				{monthProgress.progressPercentage}%
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
			{monthProgress.passedDays} d, {monthProgress.remainingDays} d remaining ({monthProgress.passedHours}/{monthProgress.remainingHours}
			h)
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
