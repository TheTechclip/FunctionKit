import { describe, test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useViewportHeight } from "@/packages/hooks/useViewportHeight";

describe("useViewportHeight", () => {
	test("returns a height value", () => {
		const { result } = renderHook(() => useViewportHeight());
		expect(result.current.height).toBeGreaterThanOrEqual(0);
	});
});
