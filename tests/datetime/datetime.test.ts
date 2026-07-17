import { describe, expect, test, vi } from "vitest";
import {
	formatClientDate,
	formatClientDateTime,
	formatClientRelative,
	formatClientTime,
} from "@/packages/datetime/dateTime.client";
import {
	formatServerDate,
	formatServerDateTime,
	formatServerRelative,
	formatServerTime,
} from "@/packages/datetime/dateTime.server";
import {
	addUtcDays,
	format24HourTime,
	formatDotDate,
	formatKoreanTime,
	formatLongDate,
	formatRelativeText,
	formatRemainingText,
	formatTwelveHourTime,
	formatUtcDateKey,
	getUtcWeekdayIndex,
	normalizeAppLocale,
	parseUtcDateInput,
	toDate,
	toIntlLocale,
	toUtcMidnight,
} from "@/packages/datetime/dateTime.shared";

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

			test("returns null when no fallback provided", () => {
				expect(parseUtcDateInput("invalid")).toBeNull();
			});

			test("handles undefined value", () => {
				expect(parseUtcDateInput(undefined)).toBeNull();
			});

			test("handles null value", () => {
				expect(parseUtcDateInput(null)).toBeNull();
			});
		});

		describe("formatUtcDateKey", () => {
			test("formats date to YYYY-MM-DD", () => {
				expect(formatUtcDateKey(new Date("2020-05-05T00:00:00Z"))).toBe("2020-05-05");
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

			test("handles missing date/time parts gracefully", () => {
				const spy = vi.spyOn(Intl.DateTimeFormat.prototype, "formatToParts").mockReturnValue([]);
				try {
					expect(formatLongDate(testDate, "kr", "UTC")).toBe("0000년 0월 0일");
					expect(format24HourTime(testDate)).toBe("00:00");
				} finally {
					spy.mockRestore();
				}
			});

			test("formatDotDate", () => {
				expect(formatDotDate(testDate, "UTC")).toBe("2020. 5. 10.");
			});

			test("format24HourTime", () => {
				expect(format24HourTime(testDate, { timeZone: "UTC" })).toBe("15:30");
				expect(format24HourTime(testDate, { includeSeconds: true, timeZone: "UTC" })).toBe(
					"15:30:45",
				);
				expect(format24HourTime(testDate)).toBe("15:30");
			});

			test("formatKoreanTime", () => {
				expect(formatKoreanTime(testDate, "UTC")).toBe("오후 3시 30분");
				expect(formatKoreanTime(new Date("2020-05-10T09:15:00Z"), "UTC")).toBe("오전 9시 15분");
				expect(formatKoreanTime(new Date("2020-05-10T00:30:00Z"), "UTC")).toBe("오전 12시 30분");
				expect(formatKoreanTime(new Date("2020-05-10T12:30:00Z"), "UTC")).toBe("오후 12시 30분");
			});

			test("formatTwelveHourTime", () => {
				expect(formatTwelveHourTime(testDate, "kr", "UTC")).toBe("오후 3:30");
				expect(formatTwelveHourTime(new Date("2020-05-10T00:30:00Z"), "kr", "UTC")).toBe(
					"오전 12:30",
				);
				expect(formatTwelveHourTime(new Date("2020-05-10T12:30:00Z"), "kr", "UTC")).toBe(
					"오후 12:30",
				);
				expect(formatTwelveHourTime(testDate, "en", "UTC")).toMatch(/3:30 (PM|pm)/);
			});
		});

		describe("formatRelativeText", () => {
			test("formatRelativeUnit with singular count (1 second, 1 minute, etc)", () => {
				expect(formatRelativeText(1000, "en")).toEqual({
					text: "1 second ago",
					isRelative: true,
				});
				expect(formatRelativeText(60000, "en")).toEqual({
					text: "1 minute ago",
					isRelative: true,
				});
				expect(formatRelativeText(3600000, "en")).toEqual({
					text: "1 hour ago",
					isRelative: true,
				});
				expect(formatRelativeText(86400000, "en")).toEqual({
					text: "1 day ago",
					isRelative: true,
				});
			});

			test("formats seconds", () => {
				expect(formatRelativeText(30000, "en")).toEqual({
					text: "30 seconds ago",
					isRelative: true,
				});
				expect(formatRelativeText(30000, "kr")).toEqual({
					text: "30초 전",
					isRelative: true,
				});
				expect(formatRelativeText(30000, "jp")).toEqual({
					text: "30秒前",
					isRelative: true,
				});
			});
			test("formats minutes", () => {
				expect(formatRelativeText(120000, "en")).toEqual({
					text: "2 minutes ago",
					isRelative: true,
				});
				expect(formatRelativeText(120000, "kr")).toEqual({
					text: "2분 전",
					isRelative: true,
				});
				expect(formatRelativeText(120000, "jp")).toEqual({
					text: "2分前",
					isRelative: true,
				});
			});
			test("formats hours", () => {
				expect(formatRelativeText(7200000, "en")).toEqual({
					text: "2 hours ago",
					isRelative: true,
				});
				expect(formatRelativeText(7200000, "kr")).toEqual({
					text: "2시간 전",
					isRelative: true,
				});
				expect(formatRelativeText(7200000, "jp")).toEqual({
					text: "2時間前",
					isRelative: true,
				});
			});
			test("formats days", () => {
				expect(formatRelativeText(172800000, "en")).toEqual({
					text: "2 days ago",
					isRelative: true,
				});
				expect(formatRelativeText(172800000, "kr")).toEqual({
					text: "2일 전",
					isRelative: true,
				});
				expect(formatRelativeText(172800000, "jp")).toEqual({
					text: "2日前",
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
				expect(formatRemainingText(65000, "en")).toBe("1 minute 5 seconds left");
				expect(formatRemainingText(3665000, "kr")).toBe("1시간 1분 남음");
				expect(formatRemainingText(90065000, "jp")).toBe("あと1日1時間");
			});
			test("without suffix", () => {
				expect(formatRemainingText(1000, "en", { includeSuffix: false })).toBe("1 second");
			});

			test("remaining time less than 1 second defaults to 1 second", () => {
				expect(formatRemainingText(500, "en")).toBe("1 second left");
			});

			test("formatRemainingText jp locale with no suffix", () => {
				expect(formatRemainingText(3665000, "jp", { includeSuffix: false })).toBe("1時間1分");
			});

			test("formatRemainingUnit for kr locale covers all units", () => {
				expect(formatRemainingText(1000, "kr")).toBe("1초 남음");
				expect(formatRemainingText(60000, "kr")).toBe("1분 남음");
				expect(formatRemainingText(3600000, "kr")).toBe("1시간 남음");
				expect(formatRemainingText(86400000, "kr")).toBe("1일 남음");
			});

			test("formatRemainingUnit for jp locale", () => {
				expect(formatRemainingText(1000, "jp")).toBe("あと1秒");
				expect(formatRemainingText(60000, "jp")).toBe("あと1分");
				expect(formatRemainingText(3600000, "jp")).toBe("あと1時間");
				expect(formatRemainingText(86400000, "jp")).toBe("あと1日");
			});

			test("formatRemainingUnit for en locale covers all units", () => {
				expect(formatRemainingText(1000, "en")).toBe("1 second left");
				expect(formatRemainingText(60000, "en")).toBe("1 minute left");
				expect(formatRemainingText(3600000, "en")).toBe("1 hour left");
				expect(formatRemainingText(86400000, "en")).toBe("1 day left");
			});

			test("formatLongDate with undefined locale defaults to en", () => {
				expect(formatLongDate(new Date("2020-05-10T15:00:00Z"), undefined)).toContain("2020");
			});

			test("formatRelativeText with jp locale", () => {
				expect(formatRelativeText(30000, "jp")).toEqual({
					text: "30秒前",
					isRelative: true,
				});
				expect(formatRelativeText(120000, "jp")).toEqual({
					text: "2分前",
					isRelative: true,
				});
				expect(formatRelativeText(7200000, "jp")).toEqual({
					text: "2時間前",
					isRelative: true,
				});
				expect(formatRelativeText(172800000, "jp")).toEqual({
					text: "2日前",
					isRelative: true,
				});
			});
		});
	});

	describe("client/server wrappers", () => {
		const testDate = new Date("2020-05-10T15:30:45Z");

		test("formatClientDateTime / formatServerDateTime", () => {
			expect(formatClientDateTime(testDate, { timeZone: "UTC" })).toBe("May 10, 2020 15:30");
			expect(formatClientDateTime(testDate, { locale: "kr", timeZone: "UTC" })).toBe(
				"2020년 5월 10일 15:30",
			);
			expect(formatServerDateTime(testDate, { locale: "kr", timeZone: "UTC" })).toBe(
				"2020년 5월 10일 15:30",
			);
		});

		test("formatClientTime with various presets", () => {
			expect(formatClientTime(testDate, { preset: "ko", timeZone: "UTC" })).toBe("오후 3시 30분");
			expect(formatClientTime(testDate, { preset: "12h", locale: "en", timeZone: "UTC" })).toMatch(
				/3:30 (PM|pm)/,
			);
			expect(formatClientTime(testDate, { preset: "24h-second", timeZone: "UTC" })).toBe(
				"15:30:45",
			);
		});

		test("formatServerTime with various presets", () => {
			expect(formatServerTime(testDate, { preset: "ko", timeZone: "UTC" })).toBe("오후 3시 30분");
			expect(formatServerTime(testDate, { preset: "12h", locale: "en", timeZone: "UTC" })).toMatch(
				/3:30 (PM|pm)/,
			);
			expect(formatServerTime(testDate, { preset: "24h-second", timeZone: "UTC" })).toBe(
				"15:30:45",
			);
		});

		test("formatClientTime returns empty for invalid date", () => {
			expect(formatClientTime("invalid", { preset: "24h-minute" })).toBe("");
		});

		test("formatClientDateTime returns only date or time when one is empty", () => {
			expect(formatClientDateTime("invalid", {})).toBe("");
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

		test("formatClientRelative returns empty when given invalid date", () => {
			expect(formatClientRelative("invalid", {})).toEqual({ text: "", isRelative: false });
		});

		test("formatClientRelative beyond maxRelative without fallbackDatePreset uses dot default", () => {
			const oldDate = new Date("2020-01-01T00:00:00Z");
			const now = new Date("2020-05-10T00:00:00Z");
			const result = formatClientRelative(oldDate, { now, maxRelativeDays: 30, locale: "en" });
			expect(result.isRelative).toBe(false);
			expect(result.text).toContain("2020");
		});

		test("formatClientRelative returns empty when now is invalid", () => {
			expect(formatClientRelative(testDate, { now: "invalid" })).toEqual({
				text: "",
				isRelative: false,
			});
		});

		test("formatServerRelative returns empty when given invalid date", () => {
			expect(formatServerRelative("invalid", {})).toEqual({ text: "", isRelative: false });
		});

		test("formatServerRelative returns empty when now is invalid", () => {
			expect(formatServerRelative(testDate, { now: "invalid" })).toEqual({
				text: "",
				isRelative: false,
			});
		});

		test("formatServerRelative beyond maxRelativeDays with fallback preset", () => {
			const oldDate = new Date("2020-01-01T00:00:00Z");
			const now = new Date("2020-05-10T00:00:00Z");
			const result = formatServerRelative(oldDate, {
				now,
				maxRelativeDays: 30,
				fallbackDatePreset: "long",
				locale: "en",
			});
			expect(result.isRelative).toBe(false);
			expect(typeof result.text).toBe("string");
		});

		test("formatServerRelative beyond maxRelative without fallbackDatePreset", () => {
			const oldDate = new Date("2020-01-01T00:00:00Z");
			const now = new Date("2020-05-10T00:00:00Z");
			const result = formatServerRelative(oldDate, { now, maxRelativeDays: 30, locale: "en" });
			expect(result.isRelative).toBe(false);
			expect(result.text).toContain("2020");
		});

		test("formatServerDate returns empty for invalid date", () => {
			expect(formatServerDate("invalid", { preset: "dot" })).toBe("");
		});

		test("formatServerDate with dot preset", () => {
			expect(formatServerDate(testDate, { preset: "dot", timeZone: "UTC" })).toBe("2020. 5. 10.");
		});

		test("formatServerDate with long preset", () => {
			expect(formatServerDate(testDate, { preset: "long", locale: "kr", timeZone: "UTC" })).toBe(
				"2020년 5월 10일",
			);
		});

		test("formatServerDateTime returns only date when time is empty", () => {
			expect(formatServerDateTime("invalid", {})).toBe("");
		});

		test("handles invalid inputs gracefully", () => {
			expect(formatClientDate("invalid", { preset: "long" })).toBe("");
			expect(formatServerTime("invalid", { preset: "ko" })).toBe("");
		});
	});
});
