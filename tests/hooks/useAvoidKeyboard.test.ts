import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useAvoidKeyboard } from "@/packages/hooks/useAvoidKeyboard";

import { useKeyboardHeight } from "@/packages/hooks/useKeyboardHeight";

vi.mock("@/packages/hooks/useKeyboardHeight");

describe("useAvoidKeyboard", () => {
	beforeEach(() => {
		vi.mocked(useKeyboardHeight).mockReturnValue({ keyboardHeight: 0 });
	});

	test("returns style object", () => {
		const { result } = renderHook(() => useAvoidKeyboard());
		expect(result.current.style).toBeDefined();
		expect(result.current.style.transform).toBeUndefined();
		expect(result.current.style.transition).toContain("transform");
	});

	test("applies translateY when keyboard is raised", () => {
		vi.mocked(useKeyboardHeight).mockReturnValue({ keyboardHeight: 300 });
		const { result } = renderHook(() => useAvoidKeyboard());
		expect(result.current.style.transform).toBe("translateY(-300px)");
	});

	test("uses safeAreaBottom when keyboardHeight is 0", () => {
		const { result } = renderHook(() => useAvoidKeyboard({ safeAreaBottom: 20 }));
		expect(result.current.style.transform).toBe("translateY(-20px)");
	});

	test("no transform when both keyboardHeight and safeAreaBottom are 0", () => {
		const { result } = renderHook(() => useAvoidKeyboard());
		expect(result.current.style.transform).toBeUndefined();
	});

	test("accepts custom transition values", () => {
		const { result } = renderHook(() =>
			useAvoidKeyboard({ transitionDuration: 300, transitionTimingFunction: "linear" }),
		);
		expect(result.current.style.transition).toBe("transform 300ms linear");
	});
});
