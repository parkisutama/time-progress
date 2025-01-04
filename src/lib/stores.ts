import { writable } from 'svelte/store';
import { DateTime } from 'luxon';

// Define the structure of progress data
interface PeriodProgress {
    progressPercentage: number;
    passedHours: number;
    remainingHours: number;
    passedDays: number;
    remainingDays: number;
    start: DateTime;
    end: DateTime;
}

// Define the structure of the store's state
interface ProgressData {
    time: string;
    date: string;
    progress: {
        day: PeriodProgress;
        week: PeriodProgress;
        month: PeriodProgress;
        quarter: PeriodProgress;
        year: PeriodProgress;
    };
}

// Helper function to calculate progress for any time period
function calculateProgress(start: DateTime, end: DateTime): PeriodProgress {
    const now = DateTime.local();

    // Clamp current time within the range
    const clampedNow = now < start ? start : now > end ? end : now;

    // Calculate total hours and days
    const totalHours = Math.round(end.diff(start, 'hours').hours); // Include all hours in the range
    const totalDays = Math.round(end.diff(start, 'days').days + 1); // Include the current day

    // Calculate passed hours and days, including the remaining portion of the current day
    const passedHours = Math.round(clampedNow.diff(start, 'hours').hours); // Include remaining hours today
    const passedDays = Math.round(clampedNow.diff(start.startOf('day'), 'days').days + 1); // Include today

    // Calculate remaining hours and days
    const remainingHours = Math.max(totalHours - passedHours, 0) - 1;
    const remainingDays = Math.max(totalDays - passedDays, 0) - 1;

    // Calculate progress percentage
    const progressPercentage = Math.round((passedHours / totalHours) * 100);

    return {
        progressPercentage,
        passedHours,
        remainingHours,
        passedDays,
        remainingDays,
        start,
        end,
    };
}



// Initialize the writable store
export const timeData = writable<ProgressData>({
    time: '',
    date: '',
    progress: {
        day: calculateProgress(DateTime.local().startOf('day'), DateTime.local().endOf('day')),
        week: calculateProgress(DateTime.local().startOf('week'), DateTime.local().endOf('week')),
        month: calculateProgress(DateTime.local().startOf('month'), DateTime.local().endOf('month')),
        quarter: calculateProgress(DateTime.local().startOf('quarter'), DateTime.local().endOf('quarter')),
        year: calculateProgress(DateTime.local().startOf('year'), DateTime.local().endOf('year')),
    },
});

// Function to update the store with live data
function updateTimeData() {
    const now = DateTime.local();

    const dayProgress = calculateProgress(now.startOf('day'), now.endOf('day'));
    const weekProgress = calculateProgress(now.startOf('week'), now.endOf('week'));
    const monthProgress = calculateProgress(now.startOf('month'), now.endOf('month'));
    const quarterProgress = calculateProgress(now.startOf('quarter'), now.endOf('quarter'));
    const yearProgress = calculateProgress(now.startOf('year'), now.endOf('year'));

    // Update the store
    timeData.set({
        time: now.toFormat('HH:mm:ss'),
        date: now.toFormat('EEEE, dd MMMM yyyy z'),
        progress: {
            day: dayProgress,
            week: weekProgress,
            month: monthProgress,
            quarter: quarterProgress,
            year: yearProgress,
        },
    });
}

// Immediately update the store to initialize data
updateTimeData();

// Update the store every second
setInterval(updateTimeData, 1000);
