import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useInterval } from "@/packages/hooks/useInterval";

describe("useInterval", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

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

	test("does not call immediate when enabled is false", () => {
		const fn = vi.fn();
		renderHook(() => useInterval(fn, { delay: 100, immediate: true, enabled: false }));
		expect(fn).not.toHaveBeenCalled();
	});

	test("handles immediate StrictMode double-fire guard", () => {
		const fn = vi.fn();
		const { rerender } = renderHook(
			({ immediate, enabled }: { immediate?: boolean; enabled?: boolean }) =>
				useInterval(fn, { delay: 100, immediate, enabled }),
			{ initialProps: { immediate: true, enabled: true } },
		);
		expect(fn).toHaveBeenCalledTimes(1);
		// Toggle enabled to trigger effect re-run while immediateCalledRef is still true
		rerender({ immediate: true, enabled: false });
		rerender({ immediate: true, enabled: true });
		// Should not call callback again (ref already set)
		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("does not call when disabled", () => {
		const fn = vi.fn();
		renderHook(() => useInterval(fn, { delay: 100, enabled: false }));
		vi.advanceTimersByTime(200);
		expect(fn).not.toHaveBeenCalled();
	});
});
