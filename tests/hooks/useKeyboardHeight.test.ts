import { describe, test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardHeight } from "@/packages/hooks/useKeyboardHeight";

describe("useKeyboardHeight", () => {
	test("returns default keyboard height of 0", () => {
		const { result } = renderHook(() => useKeyboardHeight());
		expect(result.current.keyboardHeight).toBe(0);
	});
});
