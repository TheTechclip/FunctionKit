import { describe, expect, test } from "vitest";
import {
	addUtcDays,
	formatUtcDateKey,
	getUtcWeekdayIndex,
	parseUtcDateInput,
	toDate,
	toUtcMidnight,
} from "../../web/packages/utils/dateInput";

describe("public date input and UTC arithmetic", () => {
	test.each([
		"2026-02-30",
		"2026-02-29",
		"1900-02-29",
		"2026-04-31",
		"2026-13-01",
		"2026-00-01",
		"2026-01-00",
		"2026-01-32",
		"2026-12-32",
	])("rejects impossible calendar date %s in primary and fallback inputs", (value) => {
		expect(parseUtcDateInput(value)).toBeNull();
		expect(parseUtcDateInput(undefined, value)).toBeNull();
		expect(parseUtcDateInput(value, "2024-02-29")?.toISOString()).toBe("2024-02-29T00:00:00.000Z");
	});

	test.each(["0000-02-29", "0001-01-02", "0099-12-31", "2000-02-29"])(
		"preserves the literal calendar year in %s",
		(value) => {
			expect(parseUtcDateInput(value)?.toISOString()).toBe(`${value}T00:00:00.000Z`);
			expect(parseUtcDateInput(null, ` ${value} `)?.toISOString()).toBe(`${value}T00:00:00.000Z`);
			const date = new Date(`${value}T23:45:12.123Z`);
			expect(toUtcMidnight(date).toISOString()).toBe(`${value}T00:00:00.000Z`);
			expect(parseUtcDateInput(date)?.toISOString()).toBe(`${value}T00:00:00.000Z`);
			expect(parseUtcDateInput(date.getTime())?.toISOString()).toBe(`${value}T00:00:00.000Z`);
			expect(parseUtcDateInput("invalid", date)?.toISOString()).toBe(`${value}T00:00:00.000Z`);
			expect(date.toISOString()).toBe(`${value}T23:45:12.123Z`);
		},
	);

	test("valid primary input wins over an invalid fallback and invalid Dates stay invalid", () => {
		expect(parseUtcDateInput("2026-10-08", "2026-13-01")?.toISOString()).toBe(
			"2026-10-08T00:00:00.000Z",
		);
		expect(parseUtcDateInput(new Date(Number.NaN), 0)?.toISOString()).toBe(
			"1970-01-01T00:00:00.000Z",
		);
		expect(Number.isNaN(toUtcMidnight(new Date(Number.NaN)).getTime())).toBe(true);
	});

	test("clones Date values, parses timestamps and rejects invalid values", () => {
		const original = new Date("2026-10-07T12:30:00Z");
		expect(toDate(original)).not.toBe(original);
		expect(toDate(original)?.getTime()).toBe(original.getTime());
		expect(toDate(original.getTime())?.getTime()).toBe(original.getTime());
		expect(toDate(new Date(Number.NaN))).toBeNull();
		expect(toDate("invalid")).toBeNull();
	});
	test("uses UTC calendar keys independently of timezone and preserves inputs", () => {
		const original = new Date("2026-10-07T23:30:00Z");
		expect(formatUtcDateKey(toUtcMidnight(original))).toBe("2026-10-07");
		expect(getUtcWeekdayIndex(original)).toBe(3);
		expect(formatUtcDateKey(addUtcDays(original, 1))).toBe("2026-10-08");
		expect(formatUtcDateKey(original)).toBe("2026-10-07");
	});
	test("parses date-only, timestamp and fallback inputs at midnight", () => {
		expect(parseUtcDateInput(" 2026-10-07 ")?.toISOString()).toBe("2026-10-07T00:00:00.000Z");
		expect(parseUtcDateInput("2026-10-07T23:00:00Z")?.toISOString()).toBe(
			"2026-10-07T00:00:00.000Z",
		);
		expect(parseUtcDateInput(null, "2026-10-08")?.toISOString()).toBe("2026-10-08T00:00:00.000Z");
		expect(parseUtcDateInput(undefined)).toBeNull();
		expect(parseUtcDateInput("invalid", "invalid")).toBeNull();
		expect(parseUtcDateInput(null)).toBeNull();
	});
});
