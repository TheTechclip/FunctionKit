import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
	getLocalStorage,
	getSessionStorage,
	removeLocalStorage,
	removeSessionStorage,
	updateLocalStorage,
	updateSessionStorage,
} from "@/packages/utils/browserStorage";

describe("browserStorage", () => {
	let mockStorage: Record<string, string>;
	let mockStorage2: Record<string, string>;

	beforeEach(() => {
		mockStorage = {};
		mockStorage2 = {};

		const createMockStorage = (store: Record<string, string>) => ({
			getItem: vi.fn((key) => store[key] ?? null),
			setItem: vi.fn((key, value) => {
				store[key] = value.toString();
			}),
			removeItem: vi.fn((key) => {
				delete store[key];
			}),
			clear: vi.fn(() => {
				Object.keys(store).forEach((k) => delete store[k]);
			}),
		});

		vi.stubGlobal("localStorage", createMockStorage(mockStorage));
		vi.stubGlobal("sessionStorage", createMockStorage(mockStorage2));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("localStorage operations", () => {
		updateLocalStorage("foo", { bar: "baz" });
		expect(localStorage.getItem("foo")).toBe('{"bar":"baz"}');
		expect(getLocalStorage("foo")).toEqual({ bar: "baz" });

		removeLocalStorage("foo");
		expect(getLocalStorage("foo")).toBeNull();
	});

	test("sessionStorage operations", () => {
		updateSessionStorage("foo", { bar: "baz" });
		expect(sessionStorage.getItem("foo")).toBe('{"bar":"baz"}');
		expect(getSessionStorage("foo")).toEqual({ bar: "baz" });

		removeSessionStorage("foo");
		expect(getSessionStorage("foo")).toBeNull();
	});

	test("handles invalid json gracefully", () => {
		localStorage.setItem("invalid", "not-json");
		expect(getLocalStorage("invalid")).toBeNull();
	});

	test("returns null when window is undefined (SSR)", () => {
		const win = global.window;
		// @ts-expect-error
		delete global.window;
		expect(getLocalStorage("foo")).toBeNull();
		expect(getSessionStorage("foo")).toBeNull();
		updateLocalStorage("foo", "bar");
		global.window = win;
	});

	test("handles storage setItem throwing", () => {
		const storage = localStorage;
		vi.spyOn(storage, "setItem").mockImplementation(() => {
			throw new Error("QuotaExceededError");
		});
		updateLocalStorage("foo", "bar");
		expect(storage.setItem).toHaveBeenCalled();
	});

	test("removeStorage handles missing storage gracefully", () => {
		const win = global.window;
		// @ts-expect-error
		delete global.window;
		removeLocalStorage("foo");
		removeSessionStorage("foo");
		global.window = win;
	});

	test("getLocalStorage returns null when getItem throws", () => {
		const storage = localStorage;
		vi.spyOn(storage, "getItem").mockImplementation(() => {
			throw new Error("StorageError");
		});
		expect(getLocalStorage("foo")).toBeNull();
	});

	test("removeLocalStorage handles removeItem throwing", () => {
		const storage = localStorage;
		vi.spyOn(storage, "removeItem").mockImplementation(() => {
			throw new Error("StorageError");
		});
		expect(() => removeLocalStorage("foo")).not.toThrow();
	});

	test("getLocalStorage returns null for non-existent key", () => {
		expect(getLocalStorage("non-existent-key")).toBeNull();
	});

	test("sessionStorage returns null for non-existent key", () => {
		expect(getSessionStorage("non-existent-key")).toBeNull();
	});
});
