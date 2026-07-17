import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useDoubleClick } from "@/packages/hooks/useDoubleClick";

describe("useDoubleClick", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	test("fires click on single click (event.detail === 1)", () => {
		vi.useFakeTimers();
		const click = vi.fn();
		const doubleClick = vi.fn();
		const { result } = renderHook(() => useDoubleClick({ click, doubleClick }));

		const event = new MouseEvent("click", {
			detail: 1,
		}) as unknown as React.MouseEvent<HTMLElement>;
		act(() => {
			result.current(event);
		});
		expect(doubleClick).not.toHaveBeenCalled();
		vi.advanceTimersByTime(300);
		expect(click).toHaveBeenCalledOnce();
	});

	test("clears pending timeout on unmount", () => {
		vi.useFakeTimers();
		const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
		const click = vi.fn();
		const doubleClick = vi.fn();
		const { result, unmount } = renderHook(() => useDoubleClick({ click, doubleClick }));

		const event = new MouseEvent("click", {
			detail: 1,
		}) as unknown as React.MouseEvent<HTMLElement>;
		act(() => {
			result.current(event);
		});
		unmount();
		expect(clearTimeoutSpy).toHaveBeenCalled();
		clearTimeoutSpy.mockRestore();
	});

	test("handles second click before first timeout (race condition)", () => {
		vi.useFakeTimers();
		const click = vi.fn();
		const doubleClick = vi.fn();
		const { result } = renderHook(() => useDoubleClick({ click, doubleClick }));

		const event1 = new MouseEvent("click", {
			detail: 1,
		}) as unknown as React.MouseEvent<HTMLElement>;
		const event2 = new MouseEvent("click", {
			detail: 1,
		}) as unknown as React.MouseEvent<HTMLElement>;

		act(() => {
			result.current(event1);
		});
		act(() => {
			result.current(event2);
		});
		vi.advanceTimersByTime(300);
		expect(click).toHaveBeenCalledTimes(1);
	});

	test("fires doubleClick on double click (event.detail === 2)", () => {
		const click = vi.fn();
		const doubleClick = vi.fn();
		const { result } = renderHook(() => useDoubleClick({ click, doubleClick }));

		const event = new MouseEvent("click", {
			detail: 2,
		}) as unknown as React.MouseEvent<HTMLElement>;
		act(() => {
			result.current(event);
		});
		expect(doubleClick).toHaveBeenCalledOnce();
		expect(click).not.toHaveBeenCalled();
	});
});
