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

<div class="today-progress py-4">
    <!-- <h2 class="text-xl font-bold text-blue-600">Today's Progress</h2> -->
    <div class="mt-2 relative">
        <!-- Progress Bar -->
        <div class="w-full bg-gray-300 rounded h-4">
            <div
                class="bg-gray-600 h-4 rounded progress-bar"
                style="--dynamic-width: {progressWidth}%"
            ></div>
        </div>
    <div>
        <!-- Textual Info -->
        <span class="mt-2 text-sm text-gray-600">
            {todayProgress.passedHours} hours passed, {todayProgress.remainingHours} hours remaining
        </span>
        <!-- Percentage (Bottom Right) -->
        <span class="text-sm absolute right-0 font-medium text-gray-800">
            {todayProgress.progressPercentage}%
        </span>
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
