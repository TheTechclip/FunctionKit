import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useViewportMatch } from "@/packages/hooks/useViewportMatch";

describe("useViewportMatch", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			})),
		);
	});

	test("returns false initially", () => {
		const { result } = renderHook(() => useViewportMatch("(min-width: 768px)"));
		expect(result.current).toBe(false);
	});

	test("returns true when matched", () => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation(() => ({
				matches: true,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			})),
		);
		const { result } = renderHook(() => useViewportMatch("(min-width: 768px)"));
		expect(result.current).toBe(true);
	});
});
