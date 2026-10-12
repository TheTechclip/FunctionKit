import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useIntersectionObserver } from "@/web/packages/hooks/useIntersectionObserver";

describe("useIntersectionObserver", () => {
	beforeEach(() => {
		const mockObserve = vi.fn();
		const mockUnobserve = vi.fn();
		class MockIntersectionObserver {
			observe = mockObserve;
			unobserve = mockUnobserve;
			disconnect = vi.fn();
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
			disconnect = vi.fn();
		}
		vi.stubGlobal("IntersectionObserver", MockIO);

		const callback = vi.fn();
		const { result } = renderHook(() => useIntersectionObserver(callback, { threshold: 0 }));
		const element = document.createElement("div");
		act(() => {
			(result.current as (node: HTMLElement | null) => void)(element);
		});

		const entry = { isIntersecting: true, target: element } as unknown as IntersectionObserverEntry;
		observerCallback([entry], {} as IntersectionObserver);
		expect(callback).toHaveBeenCalledWith(entry);
	});

	test("shares one observer for matching options", () => {
		const constructors: MockIntersectionObserver[] = [];
		class MockIntersectionObserver {
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
			constructor(public callback: IntersectionObserverCallback) {
				constructors.push(this);
			}
		}
		vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

		const first = renderHook(() => useIntersectionObserver(vi.fn(), { threshold: 0 }));
		const second = renderHook(() => useIntersectionObserver(vi.fn(), { threshold: 0 }));
		const firstElement = document.createElement("div");
		const secondElement = document.createElement("div");
		act(() => {
			(first.result.current as (element: HTMLElement | null) => void)(firstElement);
			(second.result.current as (element: HTMLElement | null) => void)(secondElement);
		});

		expect(constructors).toHaveLength(1);
		expect(constructors[0]?.observe).toHaveBeenCalledTimes(2);
		first.unmount();
		second.unmount();
		expect(constructors[0]?.disconnect).toHaveBeenCalledOnce();
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
	test("shares an element registration and unobserves only after the final consumer detaches", () => {
		const instances: Array<{
			callback: IntersectionObserverCallback;
			observe: ReturnType<typeof vi.fn>;
			unobserve: ReturnType<typeof vi.fn>;
			disconnect: ReturnType<typeof vi.fn>;
		}> = [];
		class MockIO {
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
			constructor(public callback: IntersectionObserverCallback) {
				instances.push(this);
			}
		}
		vi.stubGlobal("IntersectionObserver", MockIO);
		const firstCallback = vi.fn();
		const secondCallback = vi.fn();
		const first = renderHook(() => useIntersectionObserver(firstCallback, { threshold: 0.25 }));
		const second = renderHook(() => useIntersectionObserver(secondCallback, { threshold: 0.25 }));
		const element = document.createElement("div");

		act(() => {
			first.result.current(element);
			second.result.current(element);
		});
		expect(instances).toHaveLength(1);
		expect(instances[0]?.observe).toHaveBeenCalledOnce();

		const entry = { target: element, isIntersecting: true } as unknown as IntersectionObserverEntry;
		act(() => instances[0]?.callback([entry], instances[0] as unknown as IntersectionObserver));
		expect(firstCallback).toHaveBeenCalledWith(entry);
		expect(secondCallback).toHaveBeenCalledWith(entry);

		act(() => first.result.current(null));
		expect(instances[0]?.unobserve).not.toHaveBeenCalled();
		act(() => second.result.current(null));
		expect(instances[0]?.unobserve).toHaveBeenCalledOnce();
		expect(instances[0]?.disconnect).toHaveBeenCalledOnce();
	});

	test("uses stable root ids, option ordering, and separate buckets for distinct roots", () => {
		const constructors: Array<{ options?: IntersectionObserverInit }> = [];
		class MockIO {
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
			constructor(
				_callback: IntersectionObserverCallback,
				public options?: IntersectionObserverInit,
			) {
				constructors.push(this);
			}
		}
		vi.stubGlobal("IntersectionObserver", MockIO);
		const rootA = document.createElement("section");
		const rootB = document.createElement("section");
		const first = renderHook(() =>
			useIntersectionObserver(vi.fn(), { threshold: [0, 1], rootMargin: "1px", root: rootA }),
		);
		const second = renderHook(() =>
			useIntersectionObserver(vi.fn(), { root: rootA, rootMargin: "1px", threshold: [0, 1] }),
		);
		const third = renderHook(() =>
			useIntersectionObserver(vi.fn(), { root: rootB, threshold: [0, 1] }),
		);
		act(() => {
			first.result.current(document.createElement("div"));
			second.result.current(document.createElement("div"));
			third.result.current(document.createElement("div"));
		});
		expect(constructors).toHaveLength(2);
		first.unmount();
		second.unmount();
		third.unmount();
	});

	test("re-registers when options change while preserving equivalent options", () => {
		const constructors: MockIntersectionObserver[] = [];
		class MockIntersectionObserver {
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
			constructor(public callback: IntersectionObserverCallback) {
				constructors.push(this);
			}
		}
		vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
		const callback = vi.fn();
		const { result, rerender } = renderHook(
			({ threshold }) => useIntersectionObserver(callback, { threshold }),
			{ initialProps: { threshold: 0 } },
		);
		const element = document.createElement("div");
		act(() => result.current(element));
		expect(constructors).toHaveLength(1);
		const initialRef = result.current;

		rerender({ threshold: 0 });
		expect(result.current).toBe(initialRef);
		expect(constructors).toHaveLength(1);

		rerender({ threshold: 1 });
		expect(result.current).not.toBe(initialRef);
		act(() => initialRef(null));
		act(() => result.current(element));
		expect(constructors).toHaveLength(2);
	});

	test("ignores entries for unregistered targets and resets buckets when constructor changes", () => {
		let firstCallback: IntersectionObserverCallback = () => {};
		const firstDisconnect = vi.fn();
		class FirstIO {
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = firstDisconnect;
			constructor(callback: IntersectionObserverCallback) {
				firstCallback = callback;
			}
		}
		vi.stubGlobal("IntersectionObserver", FirstIO);
		const callback = vi.fn();
		const first = renderHook(() => useIntersectionObserver(callback, { threshold: 0.4 }));
		act(() => first.result.current(document.createElement("div")));
		const unknown = document.createElement("div");
		act(() =>
			firstCallback(
				[{ target: unknown } as unknown as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		expect(callback).not.toHaveBeenCalled();

		class SecondIO {
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
		}
		vi.stubGlobal("IntersectionObserver", SecondIO);
		const second = renderHook(() => useIntersectionObserver(vi.fn(), { threshold: 0.8 }));
		act(() => second.result.current(document.createElement("div")));
		expect(firstDisconnect).toHaveBeenCalledOnce();
		first.unmount();
		second.unmount();
	});

	test("does not register an element when IntersectionObserver is unavailable", () => {
		vi.stubGlobal("IntersectionObserver", undefined);
		const { result } = renderHook(() => useIntersectionObserver(vi.fn()));
		expect(() => {
			act(() => result.current(document.createElement("div")));
		}).not.toThrow();
	});
});
