import { describe, test, expect, vi, afterEach } from "vitest";
import { NavigatorClipboard, NavigatorShare } from "@/packages/utils/clipboardShare";

describe("NavigatorClipboard", () => {
	test("resolves with success: true on write", async () => {
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn(() => Promise.resolve()) },
			writable: true,
			configurable: true,
		});

		const result = await NavigatorClipboard({ text: "hello" });
		expect(result).toEqual({ success: true });
	});

	test("resolves with success: false on failure", async () => {
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn(() => Promise.reject(new Error("denied"))) },
			writable: true,
			configurable: true,
		});

		const result = await NavigatorClipboard({ text: "hello" });
		expect(result).toEqual({ success: false });
	});
});

describe("NavigatorShare", () => {
	afterEach(() => { vi.restoreAllMocks(); });

	test("uses Web Share API when available", async () => {
		Object.defineProperty(navigator, "share", {
			value: vi.fn(() => Promise.resolve()),
			writable: true,
			configurable: true,
		});
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn() },
			writable: true,
			configurable: true,
		});

		const result = await NavigatorShare({ title: "Test", text: "Hello", link: "https://example.com" });
		expect(result).toEqual({ success: true, method: "share" });
	});

	test("falls back to clipboard when share is unavailable", async () => {
		Object.defineProperty(navigator, "share", {
			value: undefined,
			writable: true,
			configurable: true,
		});
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn(() => Promise.resolve()) },
			writable: true,
			configurable: true,
		});

		const result = await NavigatorShare({ title: "Test", text: "Hello", link: "https://example.com" });
		expect(result).toEqual({ success: true, method: "clipboard" });
	});

	test("returns unsupported when neither share nor clipboard", async () => {
		Object.defineProperty(navigator, "share", {
			value: undefined,
			writable: true,
			configurable: true,
		});
		Object.defineProperty(navigator, "clipboard", {
			value: undefined,
			writable: true,
			configurable: true,
		});

		const result = await NavigatorShare({ title: "Test", text: "Hello", link: "https://example.com" });
		expect(result).toEqual({ success: false, method: "unsupported" });
	});
});
