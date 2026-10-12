import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { subscribeVisualViewportResize } from "@/web/packages/utils/browser/sharedBrowserEvents";
import { subscribeKeyboardHeight } from "@/web/packages/utils/browser/subscribeKeyboardHeight";

describe("subscribeKeyboardHeight", () => {
	let viewport: EventTarget & { height: number };
	let unsubscribers: Array<() => void>;

	beforeEach(() => {
		vi.useFakeTimers();
		viewport = Object.assign(new EventTarget(), { height: 600 });
		unsubscribers = [];
		vi.stubGlobal("window", { innerHeight: 800, visualViewport: viewport });
	});

	afterEach(() => {
		for (const unsubscribe of unsubscribers) unsubscribe();
		vi.useRealTimers();
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	function subscribe(options: Parameters<typeof subscribeKeyboardHeight>[0]) {
		const subscription = subscribeKeyboardHeight(options);
		unsubscribers.push(subscription.unsubscribe);
		return subscription;
	}

	function resize(height: number, event = "resize") {
		viewport.height = height;
		viewport.dispatchEvent(new Event(event));
	}

	test("subscribes to both shared viewport channels without initial notification", () => {
		const add = vi.spyOn(viewport, "addEventListener");
		const callback = vi.fn();
		subscribe({ callback });
		expect(add).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(add).toHaveBeenCalledWith("scroll", expect.any(Function));
		vi.runAllTimers();
		expect(callback).not.toHaveBeenCalled();
	});

	test("immediate measurement uses the default throttle", () => {
		const callback = vi.fn();
		subscribe({ callback, immediate: true });
		expect(callback).not.toHaveBeenCalled();
		vi.advanceTimersByTime(15);
		expect(callback).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(callback).toHaveBeenCalledExactlyOnceWith(200);
	});

	test.each([0, -1])(
		"notifies synchronously for throttle %s and suppresses unchanged heights",
		(throttleMs) => {
			const callback = vi.fn();
			subscribe({ callback, throttleMs, immediate: true });
			expect(callback).toHaveBeenCalledExactlyOnceWith(200);
			resize(600);
			expect(callback).toHaveBeenCalledOnce();
			resize(800, "scroll");
			expect(callback.mock.calls).toEqual([[200], [0]]);
			resize(900);
			expect(callback).toHaveBeenCalledTimes(2);
		},
	);

	test("skips measurement when visualViewport is unavailable", () => {
		vi.stubGlobal("window", { innerHeight: 800, visualViewport: undefined });
		const callback = vi.fn();
		subscribe({ callback, immediate: true });
		vi.runAllTimers();
		expect(callback).not.toHaveBeenCalled();
	});

	test("delivers latest height per interval including the final keyboard close", () => {
		const callback = vi.fn();
		subscribe({ callback, throttleMs: 50 });
		resize(700);
		resize(650, "scroll");
		vi.advanceTimersByTime(50);
		expect(callback).toHaveBeenCalledExactlyOnceWith(150);
		resize(700);
		resize(800, "scroll");
		vi.advanceTimersByTime(50);
		expect(callback.mock.calls).toEqual([[150], [0]]);
		expect(vi.getTimerCount()).toBe(0);
	});

	test("does not report a keyboard that opened and closed before the first flush", () => {
		const callback = vi.fn();
		subscribe({ callback });
		resize(400);
		resize(800);
		vi.runAllTimers();
		expect(callback).not.toHaveBeenCalled();
	});

	test("unsubscribe cancels pending work and releases both native listeners", () => {
		const remove = vi.spyOn(viewport, "removeEventListener");
		const callback = vi.fn();
		const { unsubscribe } = subscribe({ callback, throttleMs: 50 });
		resize(400);
		expect(vi.getTimerCount()).toBe(1);
		unsubscribe();
		unsubscribe();
		expect(vi.getTimerCount()).toBe(0);
		expect(remove).toHaveBeenCalledTimes(2);
		expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
		resize(300);
		vi.runAllTimers();
		expect(callback).not.toHaveBeenCalled();
	});

	test("release during a dispatch prevents a captured keyboard observer from notifying", () => {
		let releaseKeyboard: () => void;
		unsubscribers.push(subscribeVisualViewportResize(() => releaseKeyboard()));
		const callback = vi.fn();
		releaseKeyboard = subscribe({ callback, throttleMs: 0 }).unsubscribe;
		resize(400);
		expect(callback).not.toHaveBeenCalled();
	});

	test("resets the throttle before callback so reentrant events schedule the next update", () => {
		const callback = vi.fn((height: number) => {
			if (height === 200) resize(800);
		});
		subscribe({ callback, immediate: true });
		vi.advanceTimersByTime(16);
		expect(callback).toHaveBeenCalledExactlyOnceWith(200);
		vi.advanceTimersByTime(16);
		expect(callback.mock.calls).toEqual([[200], [0]]);
	});
});
