import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInterval } from "@/packages/hooks/useInterval";

describe("useInterval", () => {
	beforeEach(() => { vi.useFakeTimers(); });
	afterEach(() => { vi.useRealTimers(); });

	test("calls callback repeatedly at interval", () => {
		const fn = vi.fn();
		renderHook(() => useInterval(fn, 100));
		expect(fn).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledTimes(2);
	});

	test("calls immediately with immediate option", () => {
		const fn = vi.fn();
		renderHook(() => useInterval(fn, { delay: 100, immediate: true }));
		expect(fn).toHaveBeenCalledOnce();
	});

	test("does not call when disabled", () => {
		const fn = vi.fn();
		renderHook(() => useInterval(fn, { delay: 100, enabled: false }));
		vi.advanceTimersByTime(200);
		expect(fn).not.toHaveBeenCalled();
	});
});
