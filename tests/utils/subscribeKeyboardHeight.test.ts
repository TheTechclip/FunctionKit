import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { subscribeKeyboardHeight } from "@/packages/utils/subscribeKeyboardHeight";

describe("subscribeKeyboardHeight", () => {
	let visualViewport: any;

	beforeEach(() => {
		visualViewport = {
			height: 600,
			width: 390,
			offsetTop: 0,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		};
		Object.defineProperty(window, "visualViewport", {
			value: visualViewport,
			writable: true,
			configurable: true,
		});
		Object.defineProperty(window, "innerHeight", {
			value: 800,
			writable: true,
			configurable: true,
		});
	});

	afterEach(() => { vi.useRealTimers(); });

	test("subscribes to resize events", () => {
		const callback = vi.fn();
		subscribeKeyboardHeight({ callback });
		expect(visualViewport.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(visualViewport.addEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));
	});

	test("calls immediately when immediate is true", () => {
		vi.useFakeTimers();
		const callback = vi.fn();
		subscribeKeyboardHeight({ callback, immediate: true });
		vi.advanceTimersByTime(16);
		expect(callback).toHaveBeenCalled();
	});

	test("returns unsubscribe function", () => {
		const callback = vi.fn();
		const { unsubscribe } = subscribeKeyboardHeight({ callback });
		unsubscribe();
		expect(visualViewport.removeEventListener).toHaveBeenCalled();
	});
});
