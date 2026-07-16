import { describe, test, expect, afterEach } from "vitest";
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
			value: "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
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
			value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
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
			value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.isMobile).toBe(false);
		expect(info.browser).toBe("chrome");
	});

	test("detects Mac Safari", () => {
		Object.defineProperty(navigator, "userAgent", {
			value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.isMobile).toBe(false);
		expect(info.isMacSafari).toBe(true);
		expect(info.isSafari).toBe(true);
		expect(info.browser).toBe("safari");
	});

	test("detects Samsung Browser", () => {
		Object.defineProperty(navigator, "userAgent", {
			value: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/120.0.6099.230 Mobile Safari/537.36",
			writable: true,
			configurable: true,
		});
		const info = getDeviceInfo();
		expect(info.isSamsungBrowser).toBe(true);
		expect(info.browser).toBe("samsung");
	});
});
