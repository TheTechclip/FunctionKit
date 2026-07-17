import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useTimeout } from "@/packages/hooks/useTimeout";

describe("useTimeout", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

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

	test("clear cancels pending timeout", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => useTimeout(fn, 100));

		act(() => {
			result.current.clear();
		});
		vi.advanceTimersByTime(100);
		expect(fn).not.toHaveBeenCalled();
	});

	test("start and clear controls", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => useTimeout(fn, 1000, { enabled: false }));
		expect(result.current.isPending()).toBe(false);
		act(() => {
			result.current.start(50);
		});
		expect(result.current.isPending()).toBe(true);
		vi.advanceTimersByTime(50);
		expect(fn).toHaveBeenCalledOnce();
		expect(result.current.isPending()).toBe(false);
	});

	test("reset restarts the timeout", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => useTimeout(fn, 500));
		vi.advanceTimersByTime(200);
		act(() => {
			result.current.reset(100);
		});
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledOnce();
	});

	test("start overrides default delay", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => useTimeout(fn, 500, { enabled: false }));
		act(() => {
			result.current.start(50);
		});
		vi.advanceTimersByTime(50);
		expect(fn).toHaveBeenCalledOnce();
	});
});
