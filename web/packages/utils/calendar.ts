import type { DateInput } from "./dateInput";

function pad(value: number) {
	return String(value).padStart(2, "0");
}

function toLocalDate(value: DateInput | null | undefined) {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
	}

	if (value === null || value === undefined) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function parseLocalDateInput(value?: DateInput | null): Date | null {
	if (typeof value === "string") {
		const match = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?$/.exec(value.trim());
		if (match) {
			const [, year, month, day, hour = "0", minute = "0"] = match;
			const date = new Date(
				Number(year),
				Number(month) - 1,
				Number(day),
				Number(hour),
				Number(minute),
			);
			if (
				date.getFullYear() === Number(year) &&
				date.getMonth() === Number(month) - 1 &&
				date.getDate() === Number(day)
			) {
				return date;
			}
			return null;
		}
	}

	return toLocalDate(value);
}

export function formatLocalDateInput(date: Date, includeTime = false) {
	const value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	if (!includeTime) return value;
	return `${value} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatLocalDateDisplay(date: Date) {
	return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

export function formatLocalDateRangeDisplay(
	start: Date | null | undefined,
	end: Date | null | undefined,
) {
	if (!start) return "";
	if (!end) return formatLocalDateDisplay(start);
	return `${formatLocalDateDisplay(start)} – ${formatLocalDateDisplay(end)}`;
}

export function isSameCalendarDay(left: Date | null | undefined, right: Date | null | undefined) {
	return Boolean(
		left &&
			right &&
			left.getFullYear() === right.getFullYear() &&
			left.getMonth() === right.getMonth() &&
			left.getDate() === right.getDate(),
	);
}

export function isBeforeDate(left: Date, right: Date) {
	return (
		new Date(left.getFullYear(), left.getMonth(), left.getDate()).getTime() <
		new Date(right.getFullYear(), right.getMonth(), right.getDate()).getTime()
	);
}

export function isDateDisabled(
	date: Date,
	minDate?: DateInput | null,
	maxDate?: DateInput | null,
	disabledDaysOfWeek: number[] = [],
) {
	const min = parseLocalDateInput(minDate);
	const max = parseLocalDateInput(maxDate);
	return Boolean(
		(max && isBeforeDate(max, date)) ||
			(min && isBeforeDate(date, min)) ||
			disabledDaysOfWeek.includes(date.getDay()),
	);
}

export function getCalendarDays(year: number, month: number) {
	const first = new Date(year, month, 1);
	const last = new Date(year, month + 1, 0);
	const start = new Date(year, month, 1 - first.getDay());
	const count = Math.ceil((first.getDay() + last.getDate()) / 7) * 7;
	return Array.from({ length: count }, (_, index) => {
		const date = new Date(start);
		date.setDate(start.getDate() + index);
		return date;
	});
}
