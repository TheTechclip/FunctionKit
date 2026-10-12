import { afterEach, describe, expect, test } from "vitest";
import {
	getCookieReadState,
	hasCookieReadState,
	markCookieReadState,
} from "@/web/packages/utils/browser/readState.cookie.client";
import {
	getStorageReadState,
	hasStorageReadState,
	markStorageReadState,
} from "@/web/packages/utils/browser/readState.storage.client";

afterEach(() => {
	document.cookie = "read-test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
});

describe("cookie read state", () => {
	test("reads, checks, and marks using the caller-owned key", () => {
		expect(getCookieReadState({ key: "read-test" })).toBeNull();
		const value = markCookieReadState(["a", "b"], { key: "read-test" });
		expect(JSON.parse(value)).toEqual({ a: true, b: true });
		expect(hasCookieReadState("a", { key: "read-test" })).toBe(true);
	});
});

describe("storage read state", () => {
	test("works with any Storage-compatible object", () => {
		const values = new Map<string, string>();
		const storage = {
			getItem: (key: string) => values.get(key) ?? null,
			setItem: (key: string, value: string) => void values.set(key, value),
		};
		expect(getStorageReadState(storage, "read-test")).toBeNull();
		const value = markStorageReadState(storage, "read-test", ["a", "b"]);
		expect(JSON.parse(value)).toEqual({ a: true, b: true });
		expect(hasStorageReadState(storage, "read-test", "b")).toBe(true);
	});
});
