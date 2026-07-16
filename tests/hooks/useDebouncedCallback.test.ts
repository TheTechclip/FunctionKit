import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedCallback } from "@/packages/hooks/useDebouncedCallback";

describe("useDebouncedCallback", () => {
	beforeEach(() => { vi.useFakeTimers(); });
	afterEach(() => { vi.useRealTimers(); });

	test("debounces onChange calls", () => {
		const onChange = vi.fn();
		const { result } = renderHook(() =>
			useDebouncedCallback({ onChange, timeThreshold: 100 }),
		);

		act(() => { result.current(true); });
		vi.advanceTimersByTime(100);
		expect(onChange).toHaveBeenCalledWith(true);
	});

	test("skips duplicate value", () => {
		const onChange = vi.fn();
		const { result } = renderHook(() =>
			useDebouncedCallback({ onChange, timeThreshold: 100 }),
		);

		act(() => { result.current(true); });
		vi.advanceTimersByTime(100);
		expect(onChange).toHaveBeenCalledTimes(1);

		act(() => { result.current(true); });
		vi.advanceTimersByTime(100);
		expect(onChange).toHaveBeenCalledTimes(1);
	});
});
