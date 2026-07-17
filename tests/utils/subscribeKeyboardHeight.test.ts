import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { subscribeKeyboardHeight } from "@/packages/utils/subscribeKeyboardHeight";

type MockVisualViewport = {
	height: number;
	width: number;
	offsetTop: number;
	addEventListener: ReturnType<typeof vi.fn>;
	removeEventListener: ReturnType<typeof vi.fn>;
	dispatchEvent?: (event: Event) => boolean;
};

describe("subscribeKeyboardHeight", () => {
	let visualViewport: MockVisualViewport;

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

	afterEach(() => {
		vi.useRealTimers();
	});

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

	test("runs synchronously when throttleMs is 0", () => {
		const callback = vi.fn();
		subscribeKeyboardHeight({ callback, throttleMs: 0, immediate: true });
		expect(callback).toHaveBeenCalled();
	});

	test("skips resize when visualViewport is null", () => {
		const origVv = window.visualViewport;
		Object.defineProperty(window, "visualViewport", {
			value: undefined,
			writable: true,
			configurable: true,
		});
		const callback = vi.fn();
		subscribeKeyboardHeight({ callback, immediate: true });
		expect(callback).not.toHaveBeenCalled();
		Object.defineProperty(window, "visualViewport", {
			value: origVv,
			writable: true,
			configurable: true,
		});
	});

	test("does not call callback when height unchanged", () => {
		const callback = vi.fn();
		subscribeKeyboardHeight({ callback, throttleMs: 0, immediate: true });
		expect(callback).toHaveBeenCalledTimes(1);

		// Trigger resize with the same keyboard height
		const handler = visualViewport.addEventListener.mock.calls.find(
			([event]: [string]) => event === "resize",
		)?.[1] as () => void;
		if (handler) handler();

		// Same diff (innerHeight 800 - visualViewport.height 600 = 200), so notify(200) again
		// But lastHeight is already 200, so height !== lastHeight is false
		expect(callback).toHaveBeenCalledTimes(1);
	});

	test("handles no keyboard scenario (diff <= 0)", () => {
		const origInnerHeight = window.innerHeight;
		// First, call with keyboard raised (diff=200) so lastHeight becomes 200
		const callback = vi.fn();
		subscribeKeyboardHeight({ callback, throttleMs: 0, immediate: true });
		expect(callback).toHaveBeenCalledWith(200);
		// Now change innerHeight to match visualViewport.height (no keyboard)
		Object.defineProperty(window, "innerHeight", {
			value: 600,
			writable: true,
			configurable: true,
		});
		// Trigger resize handler
		const resizeHandler = visualViewport.addEventListener.mock.calls.find(
			([event]: [string]) => event === "resize",
		)?.[1] as () => void;
		resizeHandler();
		// diff = 600 - 600 = 0 → notify(0) → 0 !== 200 → callback(0)
		expect(callback).toHaveBeenCalledWith(0);
		Object.defineProperty(window, "innerHeight", {
			value: origInnerHeight,
			writable: true,
			configurable: true,
		});
	});

	test("throttles rapid resize events", () => {
		vi.useFakeTimers();
		const callback = vi.fn();
		subscribeKeyboardHeight({ callback, throttleMs: 50 });

		// Simulate two rapid resize events
		visualViewport.height = 700;
		visualViewport.addEventListener.mock.calls.forEach(([event, handler]: [string, () => void]) => {
			if (event === "resize") handler();
		});

		// Change height again and fire again
		visualViewport.height = 650;
		visualViewport.addEventListener.mock.calls.forEach(([event, handler]: [string, () => void]) => {
			if (event === "resize") handler();
		});

		// Only the last height should be reported after throttle
		vi.advanceTimersByTime(50);
		expect(callback).toHaveBeenCalledTimes(1);
	});

	test("returns unsubscribe function", () => {
		const callback = vi.fn();
		const { unsubscribe } = subscribeKeyboardHeight({ callback });
		unsubscribe();
		expect(visualViewport.removeEventListener).toHaveBeenCalled();
	});

	test("does not call callback after unsubscribe with throttle > 0", () => {
		vi.useFakeTimers();
		const callback = vi.fn();
		const { unsubscribe } = subscribeKeyboardHeight({ callback, throttleMs: 50 });

		// Trigger resize, which schedules a setTimeout
		visualViewport.height = 400;
		visualViewport.dispatchEvent?.(new Event("resize"));
		if (visualViewport.addEventListener.mock.calls.length > 0) {
			const handler = visualViewport.addEventListener.mock.calls[0][1];
			handler?.();
		}

		unsubscribe();
		vi.advanceTimersByTime(100);
		expect(callback).not.toHaveBeenCalled();
	});

	test("does not call callback after unsubscribe with throttle === 0", () => {
		vi.useFakeTimers();
		const callback = vi.fn();
		const { unsubscribe } = subscribeKeyboardHeight({ callback, throttleMs: 0 });

		unsubscribe();

		visualViewport.height = 400;
		if (visualViewport.addEventListener.mock.calls.length > 0) {
			const handler = visualViewport.addEventListener.mock.calls[0][1];
			handler?.();
		}
		expect(callback).not.toHaveBeenCalled();
	});
});
