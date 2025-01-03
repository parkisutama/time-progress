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

<div class="quarter-progress py-4">
    <p class="text-sm text-gray-600">
        {quarterProgress.start.toFormat('dd MMMM yyyy')} - {quarterProgress.end.toFormat('dd MMMM yyyy')}
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
            {quarterProgress.progressPercentage}%
        </span>
        <p class="mt-2 text-sm text-gray-600">
            {quarterProgress.passedDays} days ({quarterProgress.passedHours} hours) passed, {quarterProgress.remainingDays} days ({quarterProgress.remainingHours} hours) remaining
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
