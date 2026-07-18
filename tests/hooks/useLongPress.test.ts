import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useLongPress } from "@/packages/hooks/useLongPress";

function createMouseEvent(
	type: string,
	overrides?: Partial<MouseEventInit>,
): React.MouseEvent<HTMLElement> {
	return {
		type,
		nativeEvent: new MouseEvent(type, { clientX: 0, clientY: 0, ...overrides }),
		clientX: overrides?.clientX ?? 0,
		clientY: overrides?.clientY ?? 0,
	} as unknown as React.MouseEvent<HTMLElement>;
}

function createTouchEvent(type: string): React.TouchEvent<HTMLElement> {
	return {
		type,
		nativeEvent: new TouchEvent(type, {
			touches: [{ clientX: 0, clientY: 0 } as Touch],
			changedTouches: [{ clientX: 0, clientY: 0 } as Touch],
		}),
	} as unknown as React.TouchEvent<HTMLElement>;
}

describe("useLongPress", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	test("fires onLongPress after delay", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() => useLongPress(onLongPress, { delay: 200 }));

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown"));
		});
		expect(onLongPress).not.toHaveBeenCalled();
		vi.advanceTimersByTime(200);
		expect(onLongPress).toHaveBeenCalledOnce();
	});

	test("fires onClick when released before delay", () => {
		const onLongPress = vi.fn();
		const onClick = vi.fn();
		const { result } = renderHook(() => useLongPress(onLongPress, { delay: 200, onClick }));

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown"));
		});
		act(() => {
			result.current.onMouseUp(createMouseEvent("mouseup"));
		});
		vi.advanceTimersByTime(200);
		expect(onLongPress).not.toHaveBeenCalled();
		expect(onClick).toHaveBeenCalledOnce();
	});

	test("no click callback fires when released before delay without onClick handler", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() => useLongPress(onLongPress, { delay: 200 }));

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown"));
		});
		act(() => {
			result.current.onMouseUp(createMouseEvent("mouseup"));
		});
		vi.advanceTimersByTime(200);
		expect(onLongPress).not.toHaveBeenCalled();
	});

	test("uses mouse position without touches for getClientPosition", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() =>
			useLongPress(onLongPress, { delay: 200, moveThreshold: { x: 50 } }),
		);

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown", { clientX: 100, clientY: 200 }));
		});
		vi.advanceTimersByTime(50);
		// Move less than threshold — should not cancel
		act(() => {
			result.current.onMouseMove(createMouseEvent("mousemove", { clientX: 110, clientY: 200 }));
		});
		vi.advanceTimersByTime(150);
		expect(onLongPress).toHaveBeenCalledOnce();
	});

	test("fires onLongPressEnd when released after long press", () => {
		const onLongPress = vi.fn();
		const onLongPressEnd = vi.fn();
		const { result } = renderHook(() => useLongPress(onLongPress, { delay: 200, onLongPressEnd }));

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown"));
		});
		vi.advanceTimersByTime(200);
		expect(onLongPress).toHaveBeenCalledOnce();

		act(() => {
			result.current.onMouseUp(createMouseEvent("mouseup"));
		});
		expect(onLongPressEnd).toHaveBeenCalledOnce();
	});

	test("cancels long press when moved beyond threshold (x)", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() =>
			useLongPress(onLongPress, {
				delay: 200,
				moveThreshold: { x: 10 },
			}),
		);

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown"));
		});
		act(() => {
			result.current.onMouseMove(createMouseEvent("mousemove", { clientX: 30, clientY: 0 }));
		});
		vi.advanceTimersByTime(200);
		expect(onLongPress).not.toHaveBeenCalled();
	});

	test("cancels long press when moved beyond threshold (y)", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() =>
			useLongPress(onLongPress, {
				delay: 200,
				moveThreshold: { y: 10 },
			}),
		);

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown"));
		});
		act(() => {
			result.current.onMouseMove(createMouseEvent("mousemove", { clientX: 0, clientY: 30 }));
		});
		vi.advanceTimersByTime(200);
		expect(onLongPress).not.toHaveBeenCalled();
	});

	test("does not cancel when moved within threshold", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() =>
			useLongPress(onLongPress, {
				delay: 200,
				moveThreshold: { x: 50, y: 50 },
			}),
		);

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown"));
		});
		act(() => {
			result.current.onMouseMove(createMouseEvent("mousemove", { clientX: 20, clientY: 20 }));
		});
		vi.advanceTimersByTime(200);
		expect(onLongPress).toHaveBeenCalledOnce();
	});

	test("works with touch events", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() => useLongPress(onLongPress, { delay: 200 }));

		act(() => {
			result.current.onTouchStart(createTouchEvent("touchstart"));
		});
		vi.advanceTimersByTime(200);
		expect(onLongPress).toHaveBeenCalledOnce();

		act(() => {
			result.current.onTouchEnd(createTouchEvent("touchend"));
		});
	});

	test("cancels on mouse leave", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() => useLongPress(onLongPress, { delay: 200 }));

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown"));
		});
		act(() => {
			result.current.onMouseLeave(createMouseEvent("mouseleave"));
		});
		vi.advanceTimersByTime(200);
		expect(onLongPress).not.toHaveBeenCalled();
	});

	test("mouse up after mouse leave does not fire onClick (timeout already cleared)", () => {
		const onClick = vi.fn();
		const { result } = renderHook(() => useLongPress(() => {}, { delay: 200, onClick }));

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown"));
		});
		act(() => {
			result.current.onMouseLeave(createMouseEvent("mouseleave"));
		});
		act(() => {
			result.current.onMouseUp(createMouseEvent("mouseup"));
		});
		expect(onClick).not.toHaveBeenCalled();
	});

	test("cancels a pending timer when the hook unmounts", () => {
		const onLongPress = vi.fn();
		const { result, unmount } = renderHook(() => useLongPress(onLongPress, { delay: 200 }));

		act(() => {
			result.current.onMouseDown(createMouseEvent("mousedown"));
		});
		unmount();
		vi.advanceTimersByTime(200);

		expect(onLongPress).not.toHaveBeenCalled();
	});

	test("cancels a touch gesture when the browser sends touchcancel", () => {
		const onLongPress = vi.fn();
		const { result } = renderHook(() => useLongPress(onLongPress, { delay: 200 }));

		act(() => {
			result.current.onTouchStart(createTouchEvent("touchstart"));
			result.current.onTouchCancel(createTouchEvent("touchcancel"));
		});
		vi.advanceTimersByTime(200);

		expect(onLongPress).not.toHaveBeenCalled();
	});
});
