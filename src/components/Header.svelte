<script lang="ts">
	import { timeData } from '../lib/stores';
	import { onMount } from 'svelte';

	// Reactive store subscription for today’s progress
	let todayProgress = $timeData.progress.day;

	// Animation state for the progress bar
	let progressWidth = 0;

	//set progressWidth on mount
	onMount(() => {
		progressWidth = todayProgress.progressPercentage;
	});

	// Reactively update progressWidth whenever todayProgress.progressPercentage changes
	$: if (progressWidth !== todayProgress.progressPercentage) {
		progressWidth = todayProgress.progressPercentage;
	}
</script>

<header class="px-4 py-4 text-center">
	<!-- Live Clock -->
	<div class="rounded-md bg-white px-4 py-4 shadow-md">
		<p class="timezone text-center">🌏 {$timeData.timezone}</p>
		<h2>{$timeData.time}</h2>
		<h3>{$timeData.date}</h3>
		<!-- Progress Bar -->
		<div class="h-4 rounded bg-gray-300">
			<div
				class="progress-bar h-4 rounded bg-gray-600"
				style="--dynamic-width: {progressWidth}%"
			></div>
		</div>
		<!-- Percentage (Bottom Right) -->
		<p class="absolute right-8 mt-2 text-sm font-medium text-gray-800">
			{todayProgress.progressPercentage}%
		</p>
		<!-- Textual Info -->
		<p class="textual-info mt-2 text-sm text-gray-600">
			{$timeData.todayPassedHours}
		</p>
	</div>

	<div class="today-progress px-4 py-2"></div>
</header>

<style>
	.timezone {
		font-size: 1rem;
		color: #374151;
	}
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
	h2 {
		font-size: 2rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 1rem;
		text-align: center;
	}
	h3 {
		font-size: 1rem;
		font-weight: 400;
		color: #1f2937;
		margin-bottom: 1rem;
		text-align: center;
	}
</style>
