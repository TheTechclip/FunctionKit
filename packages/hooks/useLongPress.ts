"use client";

import { type MouseEvent, type TouchEvent, useCallback, useRef } from "react";

export type UseLongPressOptions<E extends HTMLElement> = {
	delay?: number;
	moveThreshold?: {
		x?: number;
		y?: number;
	};
	onClick?: (event: MouseEvent<E> | TouchEvent<E>) => void;
	onLongPressEnd?: (event: MouseEvent<E> | TouchEvent<E>) => void;
};

export function useLongPress<E extends HTMLElement = HTMLElement>(
	onLongPress: (event: MouseEvent<E> | TouchEvent<E>) => void,
	{
		delay = 500,
		moveThreshold,
		onClick,
		onLongPressEnd,
	}: UseLongPressOptions<E> = {},
) {
	const timeoutRef = useRef<number | null>(null);
	const isLongPressActiveRef = useRef(false);
	const initialPositionRef = useRef({ x: 0, y: 0 });

	const savedOnLongPress = useRef(onLongPress);
	const savedOnClick = useRef(onClick);
	const savedOnLongPressEnd = useRef(onLongPressEnd);
	savedOnLongPress.current = onLongPress;
	savedOnClick.current = onClick;
	savedOnLongPressEnd.current = onLongPressEnd;

	const hasThreshold =
		moveThreshold?.x !== undefined || moveThreshold?.y !== undefined;

	const getClientPosition = useCallback(
		(event: MouseEvent<E> | TouchEvent<E>) => {
			if ("touches" in event.nativeEvent) {
				const touch = event.nativeEvent.touches[0];
				return { x: touch.clientX, y: touch.clientY };
			}
			return {
				x: event.nativeEvent.clientX,
				y: event.nativeEvent.clientY,
			};
		},
		[],
	);

	const isMovedBeyondThreshold = useCallback(
		(event: MouseEvent<E> | TouchEvent<E>) => {
			const { x, y } = getClientPosition(event);
			const deltaX = Math.abs(x - initialPositionRef.current.x);
			const deltaY = Math.abs(y - initialPositionRef.current.y);

			return (
				(moveThreshold?.x !== undefined && deltaX > moveThreshold.x) ||
				(moveThreshold?.y !== undefined && deltaY > moveThreshold.y)
			);
		},
		[getClientPosition, moveThreshold],
	);

	const cancelLongPress = useCallback(() => {
		if (timeoutRef.current !== null) {
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	const handlePressStart = useCallback(
		(event: MouseEvent<E> | TouchEvent<E>) => {
			cancelLongPress();
			initialPositionRef.current = getClientPosition(event);
			isLongPressActiveRef.current = false;

			timeoutRef.current = window.setTimeout(() => {
				isLongPressActiveRef.current = true;
				savedOnLongPress.current(event);
			}, delay);
		},
		[cancelLongPress, delay, getClientPosition],
	);

	const handlePressEnd = useCallback(
		(event: MouseEvent<E> | TouchEvent<E>) => {
			if (isLongPressActiveRef.current) {
				savedOnLongPressEnd.current?.(event);
			} else if (timeoutRef.current !== null) {
				savedOnClick.current?.(event);
			}

			cancelLongPress();
			isLongPressActiveRef.current = false;
		},
		[cancelLongPress],
	);

	const handlePressMove = useCallback(
		(event: MouseEvent<E> | TouchEvent<E>) => {
			if (timeoutRef.current !== null && isMovedBeyondThreshold(event)) {
				cancelLongPress();
			}
		},
		[cancelLongPress, isMovedBeyondThreshold],
	);

	return {
		onMouseDown: handlePressStart,
		onMouseUp: handlePressEnd,
		onMouseLeave: cancelLongPress,
		onTouchStart: handlePressStart,
		onTouchEnd: handlePressEnd,
		...(hasThreshold
			? { onTouchMove: handlePressMove, onMouseMove: handlePressMove }
			: {}),
	};
}
