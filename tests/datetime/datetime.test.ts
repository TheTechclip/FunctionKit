import { describe, test, expect } from "vitest";
import {
	normalizeAppLocale,
	toIntlLocale,
	toDate,
	toUtcMidnight,
	parseUtcDateInput,
	formatUtcDateKey,
	getUtcWeekdayIndex,
	addUtcDays,
	formatLongDate,
	formatDotDate,
	format24HourTime,
	formatKoreanTime,
	formatTwelveHourTime,
	formatRelativeText,
	formatRemainingText,
} from "@/packages/datetime/dateTime.shared";
import {
	formatClientDate,
	formatClientTime,
	formatClientDateTime,
	formatClientRelative,
} from "@/packages/datetime/dateTime.client";
import {
	formatServerDate,
	formatServerTime,
	formatServerDateTime,
	formatServerRelative,
} from "@/packages/datetime/dateTime.server";

describe("datetime module", () => {
	describe("shared", () => {
		describe("normalizeAppLocale", () => {
			test("normalizes kr/ko", () => {
				expect(normalizeAppLocale("kr")).toBe("kr");
				expect(normalizeAppLocale("ko")).toBe("kr");
			});
			test("normalizes jp/ja", () => {
				expect(normalizeAppLocale("jp")).toBe("jp");
				expect(normalizeAppLocale("ja")).toBe("jp");
			});
			test("defaults to en", () => {
				expect(normalizeAppLocale("fr")).toBe("en");
				expect(normalizeAppLocale(undefined)).toBe("en");
			});
		});

		describe("toIntlLocale", () => {
			test("maps to correct intl locales", () => {
				expect(toIntlLocale("kr")).toBe("ko-KR");
				expect(toIntlLocale("jp")).toBe("ja-JP");
				expect(toIntlLocale("en")).toBe("en-US");
			});
		});

		describe("toDate", () => {
			test("returns Date object for valid inputs", () => {
				expect(toDate(new Date("2020-01-01"))).toBeInstanceOf(Date);
				expect(toDate("2020-01-01")).toBeInstanceOf(Date);
				expect(toDate(1577836800000)).toBeInstanceOf(Date);
			});
			test("returns null for invalid inputs", () => {
				expect(toDate("invalid")).toBeNull();
				expect(toDate(new Date("invalid"))).toBeNull();
			});
		});

		describe("toUtcMidnight", () => {
			test("converts to UTC midnight", () => {
				const date = new Date("2020-01-01T15:30:00Z");
				const utcDate = toUtcMidnight(date);
				expect(utcDate.toISOString()).toBe("2020-01-01T00:00:00.000Z");
			});
		});

		describe("parseUtcDateInput", () => {
			test("parses YYYY-MM-DD string to UTC midnight", () => {
				const result = parseUtcDateInput("2020-05-10");
				expect(result?.toISOString()).toBe("2020-05-10T00:00:00.000Z");
			});
			test("parses Date object to UTC midnight", () => {
				const result = parseUtcDateInput(new Date("2020-05-10T15:00:00Z"));
				expect(result?.toISOString()).toBe("2020-05-10T00:00:00.000Z");
			});
			test("uses fallback", () => {
				const result = parseUtcDateInput("invalid", "2020-01-01T00:00:00Z");
				expect(result?.toISOString()).toBe("2020-01-01T00:00:00.000Z");
			});
			test("returns null if both invalid", () => {
				expect(parseUtcDateInput("invalid", "invalid")).toBeNull();
			});
		});

		describe("formatUtcDateKey", () => {
			test("formats date to YYYY-MM-DD", () => {
				expect(formatUtcDateKey(new Date("2020-05-05T00:00:00Z"))).toBe(
					"2020-05-05",
				);
			});
		});

		describe("getUtcWeekdayIndex", () => {
			test("returns correct weekday index", () => {
				expect(getUtcWeekdayIndex(new Date("2020-01-05T00:00:00Z"))).toBe(0); // Sunday
				expect(getUtcWeekdayIndex(new Date("2020-01-06T00:00:00Z"))).toBe(1); // Monday
			});
		});

		describe("addUtcDays", () => {
			test("adds days to date", () => {
				const result = addUtcDays(new Date("2020-01-01T00:00:00Z"), 5);
				expect(result.toISOString()).toBe("2020-01-06T00:00:00.000Z");
			});
			test("handles negative days", () => {
				const result = addUtcDays(new Date("2020-01-05T00:00:00Z"), -2);
				expect(result.toISOString()).toBe("2020-01-03T00:00:00.000Z");
			});
		});

		describe("formatters", () => {
			const testDate = new Date("2020-05-10T15:30:45Z"); // UTC time

			test("formatLongDate", () => {
				expect(formatLongDate(testDate, "kr", "UTC")).toBe("2020년 5월 10일");
				expect(formatLongDate(testDate, "jp", "UTC")).toBe("2020年5月10日");
				expect(formatLongDate(testDate, "en", "UTC")).toContain("2020");
			});

			test("formatDotDate", () => {
				expect(formatDotDate(testDate, "UTC")).toBe("2020. 5. 10.");
			});

			test("format24HourTime", () => {
				expect(format24HourTime(testDate, { timeZone: "UTC" })).toBe("15:30");
				expect(
					format24HourTime(testDate, { includeSeconds: true, timeZone: "UTC" }),
				).toBe("15:30:45");
			});

			test("formatKoreanTime", () => {
				expect(formatKoreanTime(testDate, "UTC")).toBe("오후 3시 30분");
				expect(formatKoreanTime(new Date("2020-05-10T09:15:00Z"), "UTC")).toBe(
					"오전 9시 15분",
				);
			});

			test("formatTwelveHourTime", () => {
				expect(formatTwelveHourTime(testDate, "kr", "UTC")).toBe("오후 3:30");
				expect(formatTwelveHourTime(testDate, "en", "UTC")).toMatch(
					/3:30 (PM|pm)/,
				);
			});
		});

		describe("formatRelativeText", () => {
			test("formats seconds", () => {
				expect(formatRelativeText(30000, "en")).toEqual({
					text: "30 seconds ago",
					isRelative: true,
				});
				expect(formatRelativeText(30000, "kr")).toEqual({
					text: "30초 전",
					isRelative: true,
				});
			});
			test("formats minutes", () => {
				expect(formatRelativeText(120000, "en")).toEqual({
					text: "2 minutes ago",
					isRelative: true,
				});
			});
			test("formats hours", () => {
				expect(formatRelativeText(7200000, "en")).toEqual({
					text: "2 hours ago",
					isRelative: true,
				});
			});
			test("formats days", () => {
				expect(formatRelativeText(172800000, "en")).toEqual({
					text: "2 days ago",
					isRelative: true,
				});
			});
		});

		describe("formatRemainingText", () => {
			test("formats remaining time", () => {
				expect(formatRemainingText(0)).toBe("Closed");
				expect(formatRemainingText(0, "kr")).toBe("마감됨");
				expect(formatRemainingText(0, "jp")).toBe("締切終了");

				expect(formatRemainingText(1000, "en")).toBe("1 second left");
				expect(formatRemainingText(65000, "en")).toBe(
					"1 minute 5 seconds left",
				);
				expect(formatRemainingText(3665000, "kr")).toBe("1시간 1분 남음");
				expect(formatRemainingText(90065000, "jp")).toBe("あと1日1時間");
			});
			test("without suffix", () => {
				expect(formatRemainingText(1000, "en", { includeSuffix: false })).toBe(
					"1 second",
				);
			});
		});
	});

	describe("client/server wrappers", () => {
		const testDate = new Date("2020-05-10T15:30:45Z");

		test("formatClientDateTime / formatServerDateTime", () => {
			expect(formatClientDateTime(testDate, { timeZone: "UTC" })).toBe(
				"May 10, 2020 15:30",
			);
			expect(
				formatClientDateTime(testDate, { locale: "kr", timeZone: "UTC" }),
			).toBe("2020년 5월 10일 15:30");
			expect(
				formatServerDateTime(testDate, { locale: "kr", timeZone: "UTC" }),
			).toBe("2020년 5월 10일 15:30");
		});

		test("formatClientRelative / formatServerRelative", () => {
			const now = new Date("2020-05-10T15:35:45Z"); // 5 mins later
			expect(formatClientRelative(testDate, { now, locale: "kr" })).toEqual({
				text: "5분 전",
				isRelative: true,
			});
			expect(formatServerRelative(testDate, { now, locale: "kr" })).toEqual({
				text: "5분 전",
				isRelative: true,
			});

			const farFutureNow = new Date("2020-05-20T15:30:45Z"); // 10 days later
			expect(
				formatClientRelative(testDate, {
					now: farFutureNow,
					locale: "kr",
					fallbackDatePreset: "dot",
					maxRelativeDays: 7,
				}),
			).toEqual({ text: formatDotDate(testDate), isRelative: false });
		});

		test("handles invalid inputs gracefully", () => {
			expect(formatClientDate("invalid", { preset: "long" })).toBe("");
			expect(formatServerTime("invalid", { preset: "ko" })).toBe("");
		});
	});
});
