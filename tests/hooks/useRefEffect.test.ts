import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useRefEffect } from "@/packages/hooks/useRefEffect";

describe("useRefEffect", () => {
	test("calls callback with element and cleanup on unmount", () => {
		const cleanup = vi.fn();
		const callback = vi.fn(() => cleanup);
		const { result } = renderHook(() => useRefEffect(callback, []));

		const element = document.createElement("div");
		act(() => {
			(result.current as (el: HTMLElement | null) => void)(element);
		});
		expect(callback).toHaveBeenCalledWith(element);

		act(() => {
			(result.current as (el: HTMLElement | null) => void)(null);
		});
		expect(cleanup).toHaveBeenCalledOnce();
	});

	test("stores cleanup when callback returns a function", () => {
		const cleanup = vi.fn();
		const callback = vi.fn(() => cleanup);
		const { result } = renderHook(() => useRefEffect(callback, []));

		const element = document.createElement("div");
		act(() => {
			(result.current as (el: HTMLElement | null) => void)(element);
		});

		act(() => {
			(result.current as (el: HTMLElement | null) => void)(null);
		});
		expect(cleanup).toHaveBeenCalled();
	});

	test("handles callback returning undefined (no cleanup)", () => {
		const { result } = renderHook(() => useRefEffect(() => {}, []));

		const element = document.createElement("div");
		act(() => {
			(result.current as (el: HTMLElement | null) => void)(element);
		});
		// Should not throw when cleanup is undefined
		act(() => {
			(result.current as (el: HTMLElement | null) => void)(null);
		});
	});

	test("calls cleanup before setting new element", () => {
		const cleanup = vi.fn();
		const callback = vi.fn(() => cleanup);
		const { result } = renderHook(() => useRefEffect(callback, []));

		const el1 = document.createElement("div");
		const el2 = document.createElement("span");
		act(() => {
			(result.current as (el: HTMLElement | null) => void)(el1);
		});
		act(() => {
			(result.current as (el: HTMLElement | null) => void)(el2);
		});
		expect(cleanup).toHaveBeenCalledOnce();
	});
});
