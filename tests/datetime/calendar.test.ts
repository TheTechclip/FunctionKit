import { describe, expect, test } from "vitest";
import {
	formatLocalDateDisplay,
	formatLocalDateInput,
	formatLocalDateRangeDisplay,
	getCalendarDays,
	isBeforeDate,
	isDateDisabled,
	isSameCalendarDay,
	parseLocalDateInput,
} from "@/web/packages/utils/calendar";

describe("local date and calendar helpers", () => {
	test("parses and formats local date inputs", () => {
		const date = parseLocalDateInput("2026-07-17 09:30");
		expect(date).not.toBeNull();
		expect(formatLocalDateInput(date as Date)).toBe("2026-07-17");
		expect(formatLocalDateInput(date as Date, true)).toBe("2026-07-17 09:30");
		expect(parseLocalDateInput("invalid")).toBeNull();
	});

	test("accepts valid non-canonical date strings through the Date fallback", () => {
		const date = parseLocalDateInput("July 17, 2026 09:30:00");
		expect(date).toBeInstanceOf(Date);
		expect(date?.getFullYear()).toBe(2026);
		expect(date?.getMonth()).toBe(6);
		expect(date?.getDate()).toBe(17);
	});

	test("compares calendar days and renders display values", () => {
		const first = new Date(2026, 6, 17, 8);
		const second = new Date(2026, 6, 17, 20);
		const later = new Date(2026, 6, 18);
		expect(isSameCalendarDay(first, second)).toBe(true);
		expect(isBeforeDate(first, later)).toBe(true);
		expect(formatLocalDateDisplay(first)).toBe("2026. 7. 17.");
		expect(formatLocalDateRangeDisplay(first, later)).toBe("2026. 7. 17. – 2026. 7. 18.");
	});

	test("creates complete Sunday-starting calendar rows", () => {
		const days = getCalendarDays(2026, 6);
		expect(days.length % 7).toBe(0);
		expect(days[0]?.getDay()).toBe(0);
		expect(days.some((day) => day.getDate() === 1 && day.getMonth() === 6)).toBe(true);
	});

	test("applies date bounds and disabled weekdays", () => {
		const date = new Date(2026, 6, 17);
		expect(isDateDisabled(date, "2026-07-18")).toBe(true);
		expect(isDateDisabled(date, undefined, "2026-07-16")).toBe(true);
		expect(isDateDisabled(date, undefined, undefined, [date.getDay()])).toBe(true);
		expect(isDateDisabled(date, "2026-07-17", "2026-07-17")).toBe(false);
	});
	test("handles invalid Date instances, invalid calendar strings, and empty ranges", () => {
		const valid = new Date(2026, 0, 2, 3, 4);
		expect(parseLocalDateInput(valid)).not.toBe(valid);
		expect(parseLocalDateInput(valid)?.getTime()).toBe(valid.getTime());
		expect(parseLocalDateInput(new Date(Number.NaN))).toBeNull();
		expect(parseLocalDateInput(null)).toBeNull();
		expect(parseLocalDateInput(undefined)).toBeNull();
		expect(parseLocalDateInput("2026-02-31")).toBeNull();
		expect(formatLocalDateRangeDisplay(null, valid)).toBe("");
		expect(formatLocalDateRangeDisplay(valid, null)).toBe("2026. 1. 2.");
	});

	test("returns false for different or missing calendar days", () => {
		const day = new Date(2026, 0, 2);
		expect(isSameCalendarDay(day, new Date(2026, 0, 3))).toBe(false);
		expect(isSameCalendarDay(null, day)).toBe(false);
		expect(isSameCalendarDay(day, undefined)).toBe(false);
	});
});
