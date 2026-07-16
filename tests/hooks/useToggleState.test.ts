import { describe, test, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToggleState } from "@/packages/hooks/useToggleState";

describe("useToggleState", () => {
	test("initializes with false by default", () => {
		const { result } = renderHook(() => useToggleState());
		expect(result.current.value).toBe(false);
	});

	test("initializes with provided value", () => {
		const { result } = renderHook(() => useToggleState(true));
		expect(result.current.value).toBe(true);
	});

	test("setTrue sets value to true", () => {
		const { result } = renderHook(() => useToggleState(false));
		act(() => { result.current.setTrue(); });
		expect(result.current.value).toBe(true);
	});

	test("setFalse sets value to false", () => {
		const { result } = renderHook(() => useToggleState(true));
		act(() => { result.current.setFalse(); });
		expect(result.current.value).toBe(false);
	});

	test("toggle switches value", () => {
		const { result } = renderHook(() => useToggleState(false));
		act(() => { result.current.toggle(); });
		expect(result.current.value).toBe(true);
		act(() => { result.current.toggle(); });
		expect(result.current.value).toBe(false);
	});
});
