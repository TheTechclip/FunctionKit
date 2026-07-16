import { describe, test, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDoubleClick } from "@/packages/hooks/useDoubleClick";

describe("useDoubleClick", () => {
	afterEach(() => { vi.useRealTimers(); });

	test("fires click on single click (event.detail === 1)", () => {
		vi.useFakeTimers();
		const click = vi.fn();
		const doubleClick = vi.fn();
		const { result } = renderHook(() => useDoubleClick({ click, doubleClick }));

		const event = new MouseEvent("click", { detail: 1 }) as unknown as React.MouseEvent<HTMLElement>;
		act(() => { result.current(event); });
		expect(doubleClick).not.toHaveBeenCalled();
		vi.advanceTimersByTime(300);
		expect(click).toHaveBeenCalledOnce();
	});

	test("fires doubleClick on double click (event.detail === 2)", () => {
		const click = vi.fn();
		const doubleClick = vi.fn();
		const { result } = renderHook(() => useDoubleClick({ click, doubleClick }));

		const event = new MouseEvent("click", { detail: 2 }) as unknown as React.MouseEvent<HTMLElement>;
		act(() => { result.current(event); });
		expect(doubleClick).toHaveBeenCalledOnce();
		expect(click).not.toHaveBeenCalled();
	});
});
