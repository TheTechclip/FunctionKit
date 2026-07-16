import { describe, test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAvoidKeyboard } from "@/packages/hooks/useAvoidKeyboard";

describe("useAvoidKeyboard", () => {
	test("returns style object", () => {
		const { result } = renderHook(() => useAvoidKeyboard());
		expect(result.current.style).toBeDefined();
		expect(result.current.style.transform).toBeUndefined();
		expect(result.current.style.transition).toContain("transform");
	});
});
