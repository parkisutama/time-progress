import { writable } from 'svelte/store';
import { DateTime } from 'luxon';

interface PeriodProgress {
    progressPercentage: number;
    passedHours: number;
    remainingHours: number;
    passedDays: number;
    remainingDays: number;
    start: DateTime;
    end: DateTime;
}

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

// Initialize the writable store
export const timeData = writable<ProgressData>(calculateInitialData());

// Function to calculate the initial state of the store
function calculateInitialData(): ProgressData {
    const now = DateTime.now();
    return {
        time: now.toFormat('HH:mm:ss'),
        date: now.toFormat('EEEE, dd MMMM yyyy z'),
        progress: {
            day: calculateProgress(now.startOf('day'), now.endOf('day')),
            week: calculateProgress(now.startOf('week'), now.endOf('week')),
            month: calculateProgress(now.startOf('month'), now.endOf('month')),
            quarter: calculateProgress(now.startOf('quarter'), now.endOf('quarter')),
            year: calculateProgress(now.startOf('year'), now.endOf('year')),
        },
    };
}

// Helper function to create an empty PeriodProgress object
function createEmptyPeriodProgress(): PeriodProgress {
    return {
        progressPercentage: 0,
        passedHours: 0,
        remainingHours: 0,
        passedDays: 0,
        remainingDays: 0,
        start: DateTime.now(),
        end: DateTime.now(),
    };
}

// Function to calculate progress for any period
function calculateProgress(start: DateTime, end: DateTime): PeriodProgress {
    const now = DateTime.now();
    const totalHours = Math.round(end.diff(start, 'hours').hours); // Round total hours
    const passedHours = Math.round(now.diff(start, 'hours').hours); // Round passed hours
    const remainingHours = Math.round(totalHours - passedHours);

    const totalDays = Math.round(end.diff(start, 'days').days); // Round total days
    const passedDays = Math.round(now.diff(start, 'days').days); // Round passed days
    const remainingDays = Math.round(totalDays - passedDays);

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

// Function to update the store with live data
function updateTimeData() {
    const now = DateTime.now();

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

// Immediately run `updateTimeData` to set the initial state
updateTimeData();

// Update the store every second
setInterval(updateTimeData, 1000);
