import { describe, expect, test, vi } from "vitest";
import { getDistanceKilometers, getDistanceMeters } from "@/packages/utils/geoDistance";
import {
	formatCurrencyDisplayName,
	formatRegionDisplayLabel,
	formatRegionDisplayName,
	formatRegionFlagEmoji,
} from "@/packages/utils/intlDisplay";
import {
	formatTimeZoneCityName,
	formatTimeZoneDisplayLabel,
	formatTimeZoneDisplayName,
} from "@/packages/utils/timeZone";
import {
	hostMatchesAny,
	isHttpUrl,
	normalizeHostname,
	toTrimmedString,
	toURL,
} from "@/packages/utils/url";

describe("international display helpers", () => {
	test("formats regions, flags, labels, and currencies", () => {
		expect(formatRegionDisplayName("kr", "en")).toBeTruthy();
		expect(formatRegionDisplayName("HK", "kr")).toBe("홍콩");
		expect(formatRegionFlagEmoji("kr")).toBe("🇰🇷");
		expect(formatRegionFlagEmoji("UN")).toBe("🇺🇳");
		expect(formatRegionDisplayLabel({ regionCode: "KR", includeEmoji: true })).toContain("🇰🇷");
		expect(formatCurrencyDisplayName("usd", "en")).toBeTruthy();
		expect(formatRegionDisplayLabel({ regionCode: "UN", includeEmoji: true })).toContain("🇺🇳");
	});

	test("rejects invalid codes and falls back when Intl display names fail", () => {
		const DisplayNames = Intl.DisplayNames;
		vi.stubGlobal("Intl", {
			...Intl,
			DisplayNames: class {
				of() {
					throw new Error("unsupported");
				}
			},
		});
		expect(formatRegionDisplayName("ZZ")).toBe("ZZ");
		expect(formatCurrencyDisplayName("USD")).toBe("USD");
		vi.stubGlobal("Intl", { ...Intl, DisplayNames });
		expect(formatRegionDisplayName("KOR")).toBeNull();
		expect(formatRegionFlagEmoji("KOR")).toBeNull();
		expect(formatRegionDisplayLabel({ regionCode: "?" })).toBeNull();
		expect(formatCurrencyDisplayName("US")).toBeNull();
		expect(formatRegionDisplayName(null)).toBeNull();
		expect(formatRegionDisplayLabel({ regionCode: "KR" })).toBeTruthy();
	});

	test("uses code fallbacks when Intl has no display name", () => {
		vi.stubGlobal("Intl", {
			...Intl,
			DisplayNames: class {
				of() {
					return undefined;
				}
			},
		});
		expect(formatRegionDisplayName("ZZ")).toBe("ZZ");
		expect(formatCurrencyDisplayName("ZZZ")).toBe("ZZZ");
	});
});

describe("time-zone helpers", () => {
	test("uses injected city names and builds suffix labels", () => {
		const cityNames = { "Asia/Seoul": { kr: "서울" } } as const;
		expect(formatTimeZoneCityName("Asia/Seoul", "kr", cityNames)).toBe("서울");
		expect(formatTimeZoneDisplayName("Asia/Seoul", "kr", { preferCityName: true, cityNames })).toBe(
			"서울",
		);
		expect(
			formatTimeZoneDisplayLabel({
				timeZone: "Asia/Seoul",
				locale: "kr",
				suffix: "시간",
				preferCityName: true,
				cityNames,
			}),
		).toBe("서울 시간");
	});

	test("handles blanks, Intl fallback, and duplicate suffixes", () => {
		const original = Intl.DateTimeFormat;
		vi.stubGlobal("Intl", {
			...Intl,
			DateTimeFormat: class {
				formatToParts() {
					throw new Error("bad zone");
				}
			},
		});
		expect(formatTimeZoneDisplayName("Etc/Unknown", "en")).toBe("Unknown");
		vi.stubGlobal("Intl", { ...Intl, DateTimeFormat: original });
		expect(formatTimeZoneCityName("", "en")).toBeNull();
		expect(formatTimeZoneCityName("/", "en")).toBeNull();
		expect(formatTimeZoneDisplayName("", "en")).toBeNull();
		expect(formatTimeZoneDisplayLabel({ timeZone: "", suffix: "x" })).toBeNull();
		expect(
			formatTimeZoneDisplayLabel({ timeZone: "Asia/Seoul", suffix: "Seoul", preferCityName: true }),
		).toBe("Seoul");
		vi.stubGlobal("Intl", {
			...Intl,
			DateTimeFormat: class {
				formatToParts() {
					return [{ type: "timeZoneName", value: "GMT+9" }];
				}
			},
		});
		expect(formatTimeZoneDisplayName("Asia/Seoul")).toBe("Seoul");
		vi.stubGlobal("Intl", {
			...Intl,
			DateTimeFormat: class {
				formatToParts() {
					return [{ type: "timeZoneName", value: "" }];
				}
			},
		});
		expect(formatTimeZoneDisplayName("Asia/Seoul")).toBe("Seoul");
		vi.stubGlobal("Intl", {
			...Intl,
			DateTimeFormat: class {
				formatToParts() {
					return [{ type: "timeZoneName", value: "Korea Time" }];
				}
			},
		});
		expect(formatTimeZoneDisplayName("Asia/Seoul")).toBe("Korea Time");
		expect(
			formatTimeZoneDisplayLabel({
				timeZone: "Asia/Seoul",
				locale: "jp",
				suffix: "時間",
				preferCityName: true,
			}),
		).toBe("Seoul時間");
	});
});

describe("URL and geographic helpers", () => {
	test("parses and validates HTTP URLs and hosts", () => {
		expect(toTrimmedString(" a ")).toBe("a");
		expect(toTrimmedString(1)).toBe("");
		expect(toURL("/a", "https://example.com")?.href).toBe("https://example.com/a");
		expect(toURL("not a url")).toBeNull();
		expect(isHttpUrl("https://example.com/a")).toBe(true);
		expect(isHttpUrl("ftp://example.com")).toBe(false);
		expect(normalizeHostname(" WWW.Example.com. ")).toBe("example.com");
		expect(hostMatchesAny("sub.example.com", ["example.com"])).toBe(true);
		expect(hostMatchesAny("not-example.com", ["example.com"])).toBe(false);
	});

	test("calculates Haversine distances and rejects invalid coordinates", () => {
		const seoul = { latitude: 37.5665, longitude: 126.978 };
		const busan = { latitude: 35.1796, longitude: 129.0756 };
		expect(getDistanceMeters(seoul, seoul)).toBe(0);
		expect(getDistanceKilometers(seoul, busan)).toBeCloseTo(325, -1);
		expect(getDistanceMeters(null, busan)).toBeNull();
		expect(getDistanceMeters({ latitude: 91, longitude: 0 }, busan)).toBeNull();
		expect(getDistanceKilometers(null, busan)).toBeNull();
	});
});
