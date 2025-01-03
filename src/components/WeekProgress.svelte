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

<div class="week-progress py-4">
    <p class="text-sm text-gray-600">
        {weekProgress.start.toFormat('dd MMMM yyyy')} - {weekProgress.end.toFormat('dd MMMM yyyy')} [Week {weekProgress.start.toFormat('W')}]
    </p>
    <div class="mt-2 relative">
        <!-- Progress Bar -->
        <div class="w-full bg-gray-300 rounded h-4">
            <div
                class="bg-gray-600 h-4 rounded progress-bar"
                style="--dynamic-width: {progressWidth}%;"
            ></div>
        </div>
        <!-- Percentage (Bottom Right) -->
        <span class="absolute bottom-0 right-0 text-sm font-medium text-gray-800">
            {weekProgress.progressPercentage}%
        </span>
        <p class="mt-2 text-sm text-gray-600">
            {weekProgress.passedDays} days ({weekProgress.passedHours} hours) passed, {weekProgress.remainingDays} days ({weekProgress.remainingHours} hours) remaining
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
