import { afterEach, describe, expect, test } from "vitest";
import { getDeviceInfo } from "@/packages/utils/checkDevice";

describe("getDeviceInfo", () => {
	const originalUserAgent = navigator.userAgent;

	afterEach(() => {
		Object.defineProperty(navigator, "userAgent", {
			value: originalUserAgent,
			writable: true,
			configurable: true,
		});
	});

	test("returns default values in SSR (no window)", () => {
		const win = global.window;
		(global as any).window = undefined;
		const info = getDeviceInfo();
		expect(info.isMobile).toBe(false);
		expect(info.browser).toBe("unknown");
		global.window = win;
	});

	test("detects mobile Chrome", () => {
		Object.defineProperty(navigator, "userAgent", {
			value:
				"Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.isMobile).toBe(true);
		expect(info.isAndroid).toBe(true);
		expect(info.browser).toBe("chrome");
	});

	test("detects iOS Safari", () => {
		Object.defineProperty(navigator, "userAgent", {
			value:
				"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.isMobile).toBe(true);
		expect(info.isIOS).toBe(true);
		expect(info.isSafari).toBe(true);
		expect(info.isIOSSafari).toBe(true);
		expect(info.browser).toBe("safari");
	});

	test("detects desktop Chrome", () => {
		Object.defineProperty(navigator, "userAgent", {
			value:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.isMobile).toBe(false);
		expect(info.browser).toBe("chrome");
	});

	test("detects Mac Safari", () => {
		Object.defineProperty(navigator, "userAgent", {
			value:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.isMobile).toBe(false);
		expect(info.isMacSafari).toBe(true);
		expect(info.isSafari).toBe(true);
		expect(info.browser).toBe("safari");
	});

	test("detects Firefox browser", () => {
		Object.defineProperty(navigator, "userAgent", {
			value: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.browser).toBe("firefox");
	});

	test("detects Edge browser", () => {
		Object.defineProperty(navigator, "userAgent", {
			value:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/44.18362.1.0",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.browser).toBe("edge");
	});

	test("returns unknown browser for unrecognized UA", () => {
		Object.defineProperty(navigator, "userAgent", {
			value: "SomeUnknownBrowser/1.0",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.browser).toBe("unknown");
	});

	test("detects Samsung Browser", () => {
		Object.defineProperty(navigator, "userAgent", {
			value:
				"Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/120.0.6099.230 Mobile Safari/537.36",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.isSamsungBrowser).toBe(true);
		expect(info.browser).toBe("samsung");
	});

	test("detects isTouchDevice correctly", () => {
		const hasTouch = "ontouchstart" in window;
		const info = getDeviceInfo();
		expect(info.isTouchDevice).toBe(hasTouch);
	});

	test("detects desktop Safari correctly distinguishes from mobile", () => {
		Object.defineProperty(navigator, "userAgent", {
			value:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.isSafari).toBe(true);
		expect(info.isMacSafari).toBe(true);
		expect(info.isIOSSafari).toBe(false);
		expect(info.isMobile).toBe(false);
	});
});
