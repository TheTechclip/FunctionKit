import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useCheckInvisible } from "@/packages/hooks/useCheckInvisible";

describe("useCheckInvisible", () => {
	test("returns isInvisible false when element is visible", () => {
		const el = document.createElement("div");
		el.className = "test-section";
		el.getBoundingClientRect = vi.fn(
			() =>
				({
					top: 100,
					bottom: 300,
					left: 0,
					right: 100,
					width: 100,
					height: 200,
					x: 0,
					y: 100,
				}) as DOMRect,
		);
		document.body.appendChild(el);

		const { result } = renderHook(() => useCheckInvisible("test-section"));
		expect(result.current.isInvisible).toBe(false);
		document.body.removeChild(el);
	});

	test("returns isInvisible false when element is not found in DOM", () => {
		const { result } = renderHook(() => useCheckInvisible("non-existent"));
		expect(result.current.isInvisible).toBe(false);
	});

	test("returns isInvisible true when element is scrolled above viewport", () => {
		const el = document.createElement("div");
		el.className = "test-section";
		el.getBoundingClientRect = vi.fn(
			() =>
				({
					top: -50,
					bottom: 150,
					left: 0,
					right: 100,
					width: 100,
					height: 200,
					x: 0,
					y: -50,
				}) as DOMRect,
		);
		document.body.appendChild(el);

		const { result } = renderHook(() => useCheckInvisible("test-section"));
		act(() => {
			window.dispatchEvent(new Event("scroll"));
		});
		expect(result.current.isInvisible).toBe(true);
		document.body.removeChild(el);
	});
});
