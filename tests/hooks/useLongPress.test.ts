import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type React from "react";
import { useLongPress } from "@/packages/hooks/useLongPress";

function createMouseEvent(type: string): React.MouseEvent<HTMLElement> {
	return {
		type,
		nativeEvent: new MouseEvent(type, { clientX: 0, clientY: 0 }),
		clientX: 0,
		clientY: 0,
	} as unknown as React.MouseEvent<HTMLElement>;
}

describe("useLongPress", () => {
	beforeEach(() => { vi.useFakeTimers(); });
	afterEach(() => { vi.useRealTimers(); });

	test("fires onLongPress after delay", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() => useLongPress(onLongPress, { delay: 200 }));

		act(() => { result.current.onMouseDown(createMouseEvent("mousedown")); });
		expect(onLongPress).not.toHaveBeenCalled();
		vi.advanceTimersByTime(200);
		expect(onLongPress).toHaveBeenCalledOnce();
	});

	test("fires onClick when released before delay", () => {
		const onLongPress = vi.fn();
		const onClick = vi.fn();
		const { result } = renderHook(() =>
			useLongPress(onLongPress, { delay: 200, onClick }),
		);

		act(() => { result.current.onMouseDown(createMouseEvent("mousedown")); });
		act(() => { result.current.onMouseUp(createMouseEvent("mouseup")); });
		vi.advanceTimersByTime(200);
		expect(onLongPress).not.toHaveBeenCalled();
		expect(onClick).toHaveBeenCalledOnce();
	});

	test("cancels on mouse leave", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() => useLongPress(onLongPress, { delay: 200 }));

		act(() => { result.current.onMouseDown(createMouseEvent("mousedown")); });
		act(() => { result.current.onMouseLeave(createMouseEvent("mouseleave")); });
		vi.advanceTimersByTime(200);
		expect(onLongPress).not.toHaveBeenCalled();
	});
});
