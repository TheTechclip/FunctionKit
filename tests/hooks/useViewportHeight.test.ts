import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useViewportHeight } from "@/packages/hooks/useViewportHeight";

describe("useViewportHeight", () => {
	test("returns a height value", () => {
		const { result } = renderHook(() => useViewportHeight());
		expect(result.current.height).toBeGreaterThanOrEqual(0);
	});

	test("updates height on window resize", () => {
		const { result } = renderHook(() => useViewportHeight());

		act(() => {
			window.innerHeight = 500;
			window.dispatchEvent(new Event("resize"));
		});
		expect(result.current.height).toBe(500);
	});

	test("removes event listeners on unmount", () => {
		const addResize = vi.spyOn(window, "addEventListener");
		const removeResize = vi.spyOn(window, "removeEventListener");

		const { unmount } = renderHook(() => useViewportHeight());
		unmount();

		expect(removeResize).toHaveBeenCalledWith("resize", expect.any(Function));
		addResize.mockRestore();
		removeResize.mockRestore();
	});
});
