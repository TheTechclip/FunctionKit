import { describe, test, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIntersectionObserver } from "@/packages/hooks/useIntersectionObserver";

describe("useIntersectionObserver", () => {
	test("returns a ref callback", () => {
		const callback = vi.fn();
		const { result } = renderHook(() =>
			useIntersectionObserver(callback, { threshold: 0 }),
		);
		expect(typeof result.current).toBe("function");
	});
});
