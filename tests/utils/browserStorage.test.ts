import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
	getLocalStorage,
	getSessionStorage,
	removeLocalStorage,
	removeSessionStorage,
	updateLocalStorage,
	updateSessionStorage,
} from "@/web/packages/utils/browser/browserStorage";

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
				Object.keys(store).forEach((k) => {
					delete store[k];
				});
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

	test.each([
		["localStorage", getLocalStorage, updateLocalStorage, removeLocalStorage],
		["sessionStorage", getSessionStorage, updateSessionStorage, removeSessionStorage],
	] as const)(
		"handles a throwing window.%s getter for all operations",
		(kind, read, write, remove) => {
			const getter = vi.fn(() => {
				throw new DOMException("Storage is restricted", "SecurityError");
			});
			vi.stubGlobal("window", Object.defineProperty({}, kind, { get: getter }));
			expect(read("draft")).toBeNull();
			expect(() => write("draft", "text")).not.toThrow();
			expect(() => remove("draft")).not.toThrow();
			expect(getter).toHaveBeenCalledTimes(3);
		},
	);

	test("failed serialization preserves the previously stored value", () => {
		updateLocalStorage("draft", "original");
		const circular: { self?: unknown } = {};
		circular.self = circular;
		expect(() => updateLocalStorage("draft", circular)).not.toThrow();
		expect(getLocalStorage("draft")).toBe("original");
	});
});
