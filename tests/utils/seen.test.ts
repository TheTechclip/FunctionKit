import { describe, expect, test } from "vitest";
import { buildSeenValue, hasSeenKey, parseSeen, SEEN_STORAGE_KEY } from "@/packages/utils/seen";

describe("seen", () => {
	test("SEEN_STORAGE_KEY", () => {
		expect(SEEN_STORAGE_KEY).toBe("seen");
	});

	test("parseSeen", () => {
		expect(parseSeen(null)).toEqual({});
		expect(parseSeen('{"a":true}')).toEqual({ a: true });
		expect(parseSeen("invalid json")).toEqual({});
		expect(parseSeen("[]")).toEqual({});
	});

	test("hasSeenKey", () => {
		expect(hasSeenKey('{"a":true}', "a")).toBe(true);
		expect(hasSeenKey('{"a":true}', "b")).toBe(false);
		expect(hasSeenKey(null, "a")).toBe(false);
	});

	test("buildSeenValue", () => {
		const result = buildSeenValue('{"a":true}', "b");
		expect(JSON.parse(result)).toEqual({ a: true, b: true });
	});

	test("parseSeen empty string returns {}", () => {
		expect(parseSeen("")).toEqual({});
	});

	test("buildSeenValue with null raw creates fresh object", () => {
		const result = buildSeenValue(null, "key");
		expect(JSON.parse(result)).toEqual({ key: true });
	});

	test("buildSeenValue overrides existing key to true", () => {
		const result = buildSeenValue('{"key":false}', "key");
		expect(JSON.parse(result)).toEqual({ key: true });
	});
});
