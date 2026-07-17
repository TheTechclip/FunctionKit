import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { debounce, useDebounce } from "@/packages/hooks/useDebounce";

describe("debounce (standalone)", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	test("trailing: calls function after delay", () => {
		const fn = vi.fn();
		const d = debounce(fn, 100, { edges: ["trailing"] });
		d();
		expect(fn).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledOnce();
	});

	test("leading + trailing: calls immediately and debounces trailing", () => {
		const fn = vi.fn();
		const d = debounce(fn, 100, { edges: ["leading", "trailing"] });
		d();
		expect(fn).toHaveBeenCalledTimes(1);
		d();
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledTimes(2);
	});

	test("leading only: calls immediately, no trailing", () => {
		const fn = vi.fn();
		const d = debounce(fn, 100, { edges: ["leading"] });
		d();
		expect(fn).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("cancel aborts pending call", () => {
		const fn = vi.fn();
		const d = debounce(fn, 100, { edges: ["trailing"] });
		d();
		d.cancel();
		vi.advanceTimersByTime(100);
		expect(fn).not.toHaveBeenCalled();
	});

	test("multiple calls reset the timer in trailing mode", () => {
		const fn = vi.fn();
		const d = debounce(fn, 100, { edges: ["trailing"] });
		d();
		vi.advanceTimersByTime(50);
		d();
		vi.advanceTimersByTime(50);
		expect(fn).not.toHaveBeenCalled();
		vi.advanceTimersByTime(50);
		expect(fn).toHaveBeenCalledOnce();
	});
});

describe("useDebounce", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	test("returns a debounced function", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => useDebounce(fn, 100));
		result.current();
		expect(fn).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledOnce();
	});

	test("works with leading: true", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => useDebounce(fn, 100, { leading: true }));
		result.current();
		expect(fn).toHaveBeenCalledOnce();
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("works with trailing: false", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => useDebounce(fn, 100, { trailing: false }));
		result.current();
		vi.advanceTimersByTime(100);
		expect(fn).not.toHaveBeenCalled();
	});
});
