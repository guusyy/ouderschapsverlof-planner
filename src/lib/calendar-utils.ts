import { getDay, getDaysInMonth, format } from "date-fns";

export interface MonthScope {
	year: number;
	month: number; // 0-indexed
}

export function getMonthsInScope(birthDate: Date): MonthScope[] {
	const months: MonthScope[] = [];
	const startMonth = birthDate.getMonth();
	const startYear = birthDate.getFullYear();

	for (let i = 0; i < 12; i++) {
		const month = (startMonth + i) % 12;
		const year = startYear + Math.floor((startMonth + i) / 12);
		months.push({ year, month });
	}

	return months;
}

/**
 * Generate a 7-column grid for a month.
 * Weeks start on Monday (index 0 = Monday, 6 = Sunday).
 * Returns array of (Date | null) where null = padding cell.
 */
export function getMonthGrid(year: number, month: number): (Date | null)[] {
	const grid: (Date | null)[] = [];
	const daysInMonth = getDaysInMonth(new Date(year, month));

	// getDay returns 0=Sun, 1=Mon ... 6=Sat
	// We want Monday=0, so transform: (getDay + 6) % 7
	const firstDay = new Date(year, month, 1);
	const startPadding = (getDay(firstDay) + 6) % 7;

	// Add padding for days before the 1st
	for (let i = 0; i < startPadding; i++) {
		grid.push(null);
	}

	// Add actual days
	for (let d = 1; d <= daysInMonth; d++) {
		grid.push(new Date(year, month, d));
	}

	// Add trailing padding to complete the last week
	while (grid.length % 7 !== 0) {
		grid.push(null);
	}

	return grid;
}

export function dateKey(date: Date): string {
	return format(date, "yyyy-MM-dd");
}

const DUTCH_MONTH_NAMES = [
	"januari",
	"februari",
	"maart",
	"april",
	"mei",
	"juni",
	"juli",
	"augustus",
	"september",
	"oktober",
	"november",
	"december",
];

const DUTCH_DAY_ABBREVIATIONS = ["ma", "di", "wo", "do", "vr", "za", "zo"];

export function getDutchMonthName(month: number): string {
	return DUTCH_MONTH_NAMES[month];
}

export function getDutchDayAbbreviations(): string[] {
	return DUTCH_DAY_ABBREVIATIONS;
}
