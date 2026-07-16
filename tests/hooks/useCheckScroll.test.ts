import { describe, test, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCheckScroll } from "@/packages/hooks/useCheckScroll";

describe("useCheckScroll", () => {
	test("initializes with scrollY state", () => {
		Object.defineProperty(window, "scrollY", { value: 100, writable: true });
		const { result } = renderHook(() => useCheckScroll());
		expect(result.current.isScrolled).toBe(true);
	});

	test("updates state on scroll", () => {
		Object.defineProperty(window, "scrollY", { value: 0, writable: true });
		const { result } = renderHook(() => useCheckScroll());
		expect(result.current.isScrolled).toBe(false);

		act(() => {
			window.scrollY = 150;
			window.dispatchEvent(new Event("scroll"));
		});
		expect(result.current.isScrolled).toBe(true);
	});
});
