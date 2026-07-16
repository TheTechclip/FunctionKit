import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
	getLocalStorage,
	updateLocalStorage,
	removeLocalStorage,
	getSessionStorage,
	updateSessionStorage,
	removeSessionStorage,
} from "@/packages/utils/browserStorage";

describe("browserStorage", () => {
	let mockStorage: Record<string, string>;
	let mockStorage2: Record<string, string>;

	beforeEach(() => {
		mockStorage = {};
		mockStorage2 = {};

		const createMockStorage = (store: Record<string, string>) => ({
			getItem: vi.fn((key) => store[key] ?? null),
			setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
			removeItem: vi.fn((key) => { delete store[key]; }),
			clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
		});

		vi.stubGlobal("localStorage", createMockStorage(mockStorage));
		vi.stubGlobal("sessionStorage", createMockStorage(mockStorage2));
	});

	afterEach(() => { vi.unstubAllGlobals(); });

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
});
