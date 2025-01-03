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

<div class="month-progress py-4">
    <p class="text-sm text-gray-600">
        {monthProgress.start.toFormat('dd MMMM yyyy')} - {monthProgress.end.toFormat('dd MMMM yyyy')}
    </p>
    <div class="mt-2 relative">
        <!-- Progress Bar -->
        <div class="w-full bg-gray-300 rounded h-4">
            <div
                class="bg-gray-600 h-4 rounded transition-all duration-1000 ease-in-out progress-bar"
                style="--dynamic-width: {progressWidth}%;"
            ></div>
        </div>
        <!-- Percentage (Bottom Right) -->
        <span class="absolute bottom-0 right-0 text-sm font-medium text-gray-800">
            {monthProgress.progressPercentage}%
        </span>
        <p class="mt-2 text-sm text-gray-600">
            {monthProgress.passedDays} days ({monthProgress.passedHours} hours) passed, {monthProgress.remainingDays} days ({monthProgress.remainingHours} hours) remaining
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
