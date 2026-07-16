import { describe, test, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePreservedCallback } from "@/packages/hooks/usePreservedCallback";

describe("usePreservedCallback", () => {
	test("returns a stable function reference across renders", () => {
		const { result, rerender } = renderHook(
			({ cb }) => usePreservedCallback(cb),
			{ initialProps: { cb: vi.fn() } },
		);
		const firstRef = result.current;
		rerender({ cb: vi.fn() });
		expect(result.current).toBe(firstRef);
	});

	test("invokes the latest callback", () => {
		const fn1 = vi.fn();
		const fn2 = vi.fn();
		const { result, rerender } = renderHook(
			({ cb }) => usePreservedCallback(cb),
			{ initialProps: { cb: fn1 } },
		);
		rerender({ cb: fn2 });
		result.current();
		expect(fn2).toHaveBeenCalledOnce();
		expect(fn1).not.toHaveBeenCalled();
	});

	test("passes arguments through", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => usePreservedCallback(fn));
		result.current("a", 1);
		expect(fn).toHaveBeenCalledWith("a", 1);
	});
});
