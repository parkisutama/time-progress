import moment from 'moment';
import type { Moment } from 'moment';
/**
 * Calculates the progress of the current day.
 * @returns {DayProgress} Progress as percentage, passed and remaining hours.
 */
export function calculateDayProgress(): DayProgress {
    const now = moment();
    const startOfDay = now.clone().startOf('day');
    const endOfDay = now.clone().endOf('day');
    const totalHours = 24;

    const passedHours = now.diff(startOfDay, 'hours');
    const remainingHours = totalHours - passedHours;
    const progress = Math.round((passedHours / totalHours) * 100);

    return { progress, passedHours, remainingHours };
}

/**
 * Calculates the progress of the current ISO week.
 * @returns {WeekProgress} Progress as percentage, passed and remaining days, and week boundaries.
 */
export function calculateWeekProgress(): WeekProgress {
    const now = moment();
    const startOfWeek = now.clone().startOf('isoWeek');
    const endOfWeek = now.clone().endOf('isoWeek');
    const totalDays = 7;

    const passedDays = now.diff(startOfWeek, 'days') + 1; // Include today
    const remainingDays = totalDays - passedDays;
    const progress = Math.round((passedDays / totalDays) * 100);

    return {
        progress,
        passedDays,
        remainingDays,
        startOfWeek,
        endOfWeek,
    };
}

/**
 * Calculates the progress of any custom time period.
 * @param start - The start of the time period (Moment object).
 * @param end - The end of the time period (Moment object).
 * @returns {TimePeriodProgress} Progress as percentage, passed and remaining days.
 */
export function calculateTimePeriodProgress(
    start: Moment,
    end: Moment
): TimePeriodProgress {
    const now = moment();
    const totalDuration = end.diff(start, 'days') + 1;
    const passedDays = now.diff(start, 'days') + 1; // Include today
    const remainingDays = totalDuration - passedDays;
    const progress = Math.round((passedDays / totalDuration) * 100);

    return {
        progress,
        passedDays,
        remainingDays,
        start,
        end,
    };
}

/**
 * Formats a date for display in a user-friendly format.
 * @param date - The date to format.
 * @returns {string} Formatted date string.
 */
export function formatDateTime(date: Moment): string {
    return date.format('dddd, DD MMMM YYYY HH:mm:ss');
}

/**
 * Type definitions for returned progress data.
 */
export interface DayProgress {
    progress: number;
    passedHours: number;
    remainingHours: number;
}

export interface WeekProgress {
    progress: number;
    passedDays: number;
    remainingDays: number;
    startOfWeek: Moment;
    endOfWeek: Moment;
}

export interface TimePeriodProgress {
    progress: number;
    passedDays: number;
    remainingDays: number;
    start: Moment;
    end: Moment;
}
