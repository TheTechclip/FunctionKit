import { describe, test, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePreservedReference } from "@/packages/hooks/usePreservedReference";

describe("usePreservedReference", () => {
	test("returns same reference for deeply equal values", () => {
		const { result, rerender } = renderHook(
			({ val }) => usePreservedReference(val),
			{ initialProps: { val: { a: 1, b: { c: [2, 3] } } } },
		);
		const first = result.current;
		rerender({ val: { a: 1, b: { c: [2, 3] } } });
		expect(result.current).toBe(first);
	});

	test("returns new reference for different values", () => {
		const { result, rerender } = renderHook(
			({ val }) => usePreservedReference(val),
			{ initialProps: { val: { a: 1 } } },
		);
		const first = result.current;
		rerender({ val: { a: 2 } });
		expect(result.current).not.toBe(first);
	});

	test("accepts custom comparator", () => {
		const { result, rerender } = renderHook(
			({ val }) => usePreservedReference(val, () => true),
			{ initialProps: { val: { a: 1 } } },
		);
		const first = result.current;
		rerender({ val: { a: 999 } });
		expect(result.current).toBe(first);
	});
});
