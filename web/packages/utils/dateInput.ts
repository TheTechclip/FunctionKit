export type DateInput = string | number | Date;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function toDate(value: DateInput): Date | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function toUtcMidnight(date: Date): Date {
	const midnight = new Date(date.getTime());
	midnight.setUTCHours(0, 0, 0, 0);
	return midnight;
}

function parseCalendarDate(value: DateInput): Date | null {
	if (typeof value === "string") {
		const trimmed = value.trim();
		const match = DATE_ONLY_PATTERN.exec(trimmed);

		if (match) {
			const [, year, month, day] = match;
			const date = new Date(0);
			date.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
			return date.toISOString().slice(0, 10) === trimmed ? date : null;
		}
	}
	return toDate(value);
}

export function parseUtcDateInput(value?: DateInput | null, fallback?: DateInput): Date | null {
	const parsed = value !== undefined && value !== null ? parseCalendarDate(value) : null;
	if (parsed) {
		return toUtcMidnight(parsed);
	}

	if (fallback !== undefined) {
		const fallbackDate = parseCalendarDate(fallback);
		if (fallbackDate) {
			return toUtcMidnight(fallbackDate);
		}
	}

	return null;
}

export function formatUtcDateKey(date: Date): string {
	return [
		date.getUTCFullYear(),
		String(date.getUTCMonth() + 1).padStart(2, "0"),
		String(date.getUTCDate()).padStart(2, "0"),
	].join("-");
}

export function getUtcWeekdayIndex(date: Date): number {
	return date.getUTCDay();
}

export function addUtcDays(date: Date, days: number): Date {
	const next = new Date(date.getTime());
	next.setUTCDate(next.getUTCDate() + days);
	return next;
}
