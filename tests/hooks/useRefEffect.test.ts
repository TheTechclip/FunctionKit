import { act, render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { useRefEffect } from "@/web/packages/hooks/useRefEffect";

describe("useRefEffect", () => {
	test("mounted dependency changes clean up and attach the current callback during commit", () => {
		const events: string[] = [];
		function Component({ value }: { value: string }) {
			const ref = useRefEffect<HTMLDivElement>(
				(node) => {
					events.push(`attach:${value}:${node.tagName}`);
					return () => {
						events.push(`cleanup:${value}`);
					};
				},
				[value],
			);
			return createElement("div", { ref });
		}
		const { rerender, unmount } = render(createElement(Component, { value: "first" }));
		expect(events).toEqual(["attach:first:DIV"]);
		rerender(createElement(Component, { value: "second" }));
		expect(events).toEqual(["attach:first:DIV", "cleanup:first", "attach:second:DIV"]);
		unmount();
		expect(events).toEqual([
			"attach:first:DIV",
			"cleanup:first",
			"attach:second:DIV",
			"cleanup:second",
		]);
	});

	test("unchanged deps preserve attachment but node replacement uses the latest callback", () => {
		const events: string[] = [];
		function Component({ value, nodeKey }: { value: string; nodeKey: string }) {
			const ref = useRefEffect<HTMLDivElement>(() => {
				events.push(`attach:${value}`);
				return () => {
					events.push(`cleanup:${value}`);
				};
			}, []);
			return createElement("div", { key: nodeKey, ref });
		}
		const { rerender, unmount } = render(
			createElement(Component, { value: "first", nodeKey: "one" }),
		);
		rerender(createElement(Component, { value: "second", nodeKey: "one" }));
		expect(events).toEqual(["attach:first"]);
		rerender(createElement(Component, { value: "third", nodeKey: "two" }));
		expect(events).toEqual(["attach:first", "cleanup:first", "attach:third"]);
		unmount();
		expect(events.at(-1)).toBe("cleanup:third");
	});

	test("calls callback with element and cleanup on unmount", () => {
		const cleanup = vi.fn();
		const callback = vi.fn(() => cleanup);
		const { result } = renderHook(() => useRefEffect(callback, []));

		const element = document.createElement("div");
		act(() => {
			result.current(element);
		});
		expect(callback).toHaveBeenCalledWith(element);

		act(() => {
			result.current(null);
		});
		expect(cleanup).toHaveBeenCalledOnce();
	});

	test("stores cleanup when callback returns a function", () => {
		const cleanup = vi.fn();
		const callback = vi.fn(() => cleanup);
		const { result } = renderHook(() => useRefEffect(callback, []));

		const element = document.createElement("div");
		act(() => {
			result.current(element);
		});

		act(() => {
			result.current(null);
		});
		expect(cleanup).toHaveBeenCalled();
	});

	test("handles callback returning undefined (no cleanup)", () => {
		const { result } = renderHook(() => useRefEffect(() => {}, []));

		const element = document.createElement("div");
		act(() => {
			result.current(element);
		});
		// Should not throw when cleanup is undefined
		act(() => {
			result.current(null);
		});
	});

	test("calls cleanup before setting new element", () => {
		const cleanup = vi.fn();
		const callback = vi.fn(() => cleanup);
		const { result } = renderHook(() => useRefEffect(callback, []));

		const el1 = document.createElement("div");
		const el2 = document.createElement("span");
		act(() => {
			result.current(el1);
		});
		act(() => {
			result.current(el2);
		});
		expect(cleanup).toHaveBeenCalledOnce();
	});
});
