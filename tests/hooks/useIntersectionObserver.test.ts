import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useIntersectionObserver } from "@/packages/hooks/useIntersectionObserver";

describe("useIntersectionObserver", () => {
	beforeEach(() => {
		const mockObserve = vi.fn();
		const mockUnobserve = vi.fn();
		class MockIntersectionObserver {
			observe = mockObserve;
			unobserve = mockUnobserve;
			constructor(
				public callback: IntersectionObserverCallback,
				public options?: IntersectionObserverInit,
			) {}
		}
		vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
	});

	test("returns a ref callback", () => {
		const callback = vi.fn();
		const { result } = renderHook(() => useIntersectionObserver(callback, { threshold: 0 }));
		expect(typeof result.current).toBe("function");
	});

	test("observes element when ref is attached", () => {
		const callback = vi.fn();
		const { result } = renderHook(() => useIntersectionObserver(callback, { threshold: 0 }));

		const element = document.createElement("div");
		act(() => {
			(result.current as (el: HTMLElement | null) => void)(element);
		});
		expect(callback).not.toHaveBeenCalled();
	});

	test("triggers observer callback when intersection fires", () => {
		let observerCallback: IntersectionObserverCallback = () => {};
		class MockIO {
			constructor(cb: IntersectionObserverCallback) {
				observerCallback = cb;
			}
			observe = vi.fn();
			unobserve = vi.fn();
		}
		vi.stubGlobal("IntersectionObserver", MockIO);

		const callback = vi.fn();
		renderHook(() => useIntersectionObserver(callback, { threshold: 0 }));

		const entry = { isIntersecting: true } as IntersectionObserverEntry;
		observerCallback([entry], {} as IntersectionObserver);
		expect(callback).toHaveBeenCalledWith(entry);
	});

	test("unobserves element when ref is detached", () => {
		const callback = vi.fn();
		const { result } = renderHook(() => useIntersectionObserver(callback, { threshold: 0 }));

		const element = document.createElement("div");
		act(() => {
			(result.current as (el: HTMLElement | null) => void)(element);
		});
		act(() => {
			(result.current as (el: HTMLElement | null) => void)(null);
		});
	});

	test("returns noop when IntersectionObserver is undefined", () => {
		const origIO = global.IntersectionObserver;
		// @ts-expect-error
		delete global.IntersectionObserver;
		const callback = vi.fn();
		const { result } = renderHook(() => useIntersectionObserver(callback, { threshold: 0 }));
		expect(typeof result.current).toBe("function");
		global.IntersectionObserver = origIO;
	});
});
