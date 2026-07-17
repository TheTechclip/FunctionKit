import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useDebouncedCallback } from "@/packages/hooks/useDebouncedCallback";

describe("useDebouncedCallback", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	test("debounces onChange calls", () => {
		const onChange = vi.fn();
		const { result } = renderHook(() => useDebouncedCallback({ onChange, timeThreshold: 100 }));

		act(() => {
			result.current(true);
		});
		vi.advanceTimersByTime(100);
		expect(onChange).toHaveBeenCalledWith(true);
	});

	test("works with leading: true", () => {
		const onChange = vi.fn();
		const { result } = renderHook(() =>
			useDebouncedCallback({ onChange, timeThreshold: 100, leading: true }),
		);
		act(() => {
			result.current(true);
		});
		expect(onChange).toHaveBeenCalledOnce();
	});

	test("works with trailing: false", () => {
		const onChange = vi.fn();
		const { result } = renderHook(() =>
			useDebouncedCallback({ onChange, timeThreshold: 100, trailing: false }),
		);
		act(() => {
			result.current(true);
		});
		vi.advanceTimersByTime(100);
		expect(onChange).not.toHaveBeenCalled();
	});

	test("skips duplicate value", () => {
		const onChange = vi.fn();
		const { result } = renderHook(() => useDebouncedCallback({ onChange, timeThreshold: 100 }));

		act(() => {
			result.current(true);
		});
		vi.advanceTimersByTime(100);
		expect(onChange).toHaveBeenCalledTimes(1);

		act(() => {
			result.current(true);
		});
		vi.advanceTimersByTime(100);
		expect(onChange).toHaveBeenCalledTimes(1);
	});
});
