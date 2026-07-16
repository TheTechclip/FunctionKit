import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimeout } from "@/packages/hooks/useTimeout";

describe("useTimeout", () => {
	beforeEach(() => { vi.useFakeTimers(); });
	afterEach(() => { vi.useRealTimers(); });

	test("calls callback after delay", () => {
		const fn = vi.fn();
		renderHook(() => useTimeout(fn, 100));
		expect(fn).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledOnce();
	});

	test("does not call when disabled", () => {
		const fn = vi.fn();
		renderHook(() => useTimeout(fn, 100, { enabled: false }));
		vi.advanceTimersByTime(200);
		expect(fn).not.toHaveBeenCalled();
	});

	test("start and clear controls", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => useTimeout(fn, 1000, { enabled: false }));
		expect(result.current.isPending()).toBe(false);
		act(() => { result.current.start(50); });
		expect(result.current.isPending()).toBe(true);
		vi.advanceTimersByTime(50);
		expect(fn).toHaveBeenCalledOnce();
		expect(result.current.isPending()).toBe(false);
	});
});
