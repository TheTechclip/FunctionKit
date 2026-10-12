import { describe, expect, test } from "vitest";
import { hasReadState, markReadState, parseReadState } from "@/web/packages/utils/readState";

describe("readState", () => {
	test("parseReadState", () => {
		expect(parseReadState(null)).toEqual(new Set());
		expect(parseReadState('{"a":true,"b":false}')).toEqual(new Set(["a"]));
		expect(parseReadState("%7B%22a%22%3Atrue%7D")).toEqual(new Set(["a"]));
		expect(parseReadState("invalid json")).toEqual(new Set());
		expect(parseReadState("[]")).toEqual(new Set());
	});

	test("hasReadState", () => {
		expect(hasReadState('{"a":true}', "a")).toBe(true);
		expect(hasReadState('{"a":true}', "b")).toBe(false);
		expect(hasReadState(null, "a")).toBe(false);
		expect(hasReadState(null, "a", { readWhenValuesPresent: [null, "token"] })).toBe(true);
		expect(hasReadState(null, "a", { readWhenValuesPresent: [undefined, " "] })).toBe(false);
	});

	test("markReadState adds several unique item IDs", () => {
		const result = markReadState('{"a":true}', ["b", "a", " c ", ""]);
		expect(JSON.parse(result)).toEqual({ a: true, b: true, c: true });
	});

	test("markReadState accepts any iterable", () => {
		const result = markReadState(null, new Set(["key", "other"]));
		expect(JSON.parse(result)).toEqual({ key: true, other: true });
	});
});
