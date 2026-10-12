import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useControllableState } from "@/web/packages/hooks/useControllableState";

describe("useControllableState", () => {
	test("uses controlled value when provided", () => {
		const { result } = renderHook(() =>
			useControllableState({ value: "controlled", defaultValue: "fallback" }),
		);
		expect(result.current[0]).toBe("controlled");
		expect(result.current[2]).toBe(true);
	});

	test("uses and updates default value when uncontrolled", () => {
		const { result } = renderHook(() => useControllableState({ defaultValue: "initial" }));
		expect(result.current[0]).toBe("initial");
		expect(result.current[2]).toBe(false);
		act(() => result.current[1]((current) => `${current}-updated`));
		expect(result.current[0]).toBe("initial-updated");
	});

	test("does not mutate controlled state through the setter", () => {
		const { result } = renderHook(() =>
			useControllableState({ value: "controlled", defaultValue: "fallback" }),
		);
		act(() => result.current[1]("ignored"));
		expect(result.current[0]).toBe("controlled");
	});
	test("accepts a direct next value in uncontrolled mode", () => {
		const { result } = renderHook(() => useControllableState({ defaultValue: "initial" }));
		act(() => result.current[1]("direct"));
		expect(result.current[0]).toBe("direct");
	});
});
