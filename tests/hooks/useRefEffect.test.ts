import { describe, test, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRefEffect } from "@/packages/hooks/useRefEffect";

describe("useRefEffect", () => {
	test("calls callback with element and cleanup on unmount", () => {
		const cleanup = vi.fn();
		const callback = vi.fn(() => cleanup);
		const { result } = renderHook(() => useRefEffect(callback, []));

		const element = document.createElement("div");
		act(() => { (result.current as (el: HTMLElement | null) => void)(element); });
		expect(callback).toHaveBeenCalledWith(element);

		act(() => { (result.current as (el: HTMLElement | null) => void)(null); });
		expect(cleanup).toHaveBeenCalledOnce();
	});

	test("calls cleanup before setting new element", () => {
		const cleanup = vi.fn();
		const callback = vi.fn(() => cleanup);
		const { result } = renderHook(() => useRefEffect(callback, []));

		const el1 = document.createElement("div");
		const el2 = document.createElement("span");
		act(() => { (result.current as (el: HTMLElement | null) => void)(el1); });
		act(() => { (result.current as (el: HTMLElement | null) => void)(el2); });
		expect(cleanup).toHaveBeenCalledOnce();
	});
});
