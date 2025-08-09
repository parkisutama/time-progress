import { writable } from 'svelte/store';
import { DateTime } from 'luxon';

// Define the structure of progress data
export interface PeriodProgress {
	title: string;
	progressPercentage: number;
	passedHours: number;
	remainingHours: number;
	passedDays: number;
	remainingDays: number;
	start: DateTime;
	end: DateTime;
}

// Define the structure of the store's state
export interface ProgressData {
	time: string;
	date: string;
	timezone: string;
	todayPassedHours: string;
	progress: {
		day: PeriodProgress;
		week: PeriodProgress;
		month: PeriodProgress;
		quarter: PeriodProgress;
		year: PeriodProgress;
	};
}

// Helper function to calculate progress for any time period
function calculateProgress(title: string, start: DateTime, end: DateTime): PeriodProgress {
	const now = DateTime.local();
	const clampedNow = now < start ? start : now > end ? end : now;

	const totalDuration = end.diff(start);
	const passedDuration = clampedNow.diff(start);

	const totalHours = totalDuration.as('hours');
	const passedHours = passedDuration.as('hours');
	const remainingHours = totalHours - passedHours;

	const totalDays = totalDuration.as('days');
	const passedDays = passedDuration.as('days');
	const remainingDays = totalDays - passedDays;

	const progressPercentage = (passedHours / totalHours) * 100;

	return {
		title,
		progressPercentage: Math.floor(progressPercentage),
		passedHours: Math.floor(passedHours),
		remainingHours: Math.ceil(remainingHours),
		passedDays: Math.floor(passedDays),
		remainingDays: Math.ceil(remainingDays),
		start,
		end
	};
}

function getPassedHoursAndMinutes(start: DateTime, now: DateTime): string {
	const passedDuration = now.diff(start, ['hours', 'minutes']);
	const remainingDuration = now.endOf('day').diff(now, ['hours', 'minutes']);

	return `${passedDuration.hours}h ${Math.round(
		passedDuration.minutes
	)}m pass, ${remainingDuration.hours}h ${Math.round(remainingDuration.minutes)} remaining`;
}

// Initialize the writable store with empty data
export const timeData = writable<ProgressData>({
	time: '',
	date: '',
	timezone: '',
	todayPassedHours: '',
	progress: {
		day: {} as PeriodProgress,
		week: {} as PeriodProgress,
		month: {} as PeriodProgress,
		quarter: {} as PeriodProgress,
		year: {} as PeriodProgress
	}
});

// Function to update the store with live data
function updateTimeData() {
	const now = DateTime.local();

	const dayProgress = calculateProgress('Day', now.startOf('day'), now.endOf('day'));
	const weekProgress = calculateProgress('Week', now.startOf('week'), now.endOf('week'));
	const monthProgress = calculateProgress('Month', now.startOf('month'), now.endOf('month'));
	const quarterProgress = calculateProgress('Quarter', now.startOf('quarter'), now.endOf('quarter'));
	const yearProgress = calculateProgress('Year', now.startOf('year'), now.endOf('year'));

	const todayPassedHours = getPassedHoursAndMinutes(now.startOf('day'), now);

	// Update the store
	timeData.set({
		time: now.toFormat('HH:mm:ss'),
		date: now.toFormat('EEEE, dd MMMM yyyy'),
		timezone: now.zoneName,
		todayPassedHours: todayPassedHours,
		progress: {
			day: dayProgress,
			week: weekProgress,
			month: monthProgress,
			quarter: quarterProgress,
			year: yearProgress
		}
	});
}

// Immediately update the store to initialize data
updateTimeData();

// Update the store every second
setInterval(updateTimeData, 1000);
