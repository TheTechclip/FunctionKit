"use client";

import { useCallback, useEffect, useRef } from "react";

import { usePreservedCallback } from "./usePreservedCallback";

type UseTimeoutOptions = {
	enabled?: boolean;
};

export type UseTimeoutControls = {
	start: (overrideDelay?: number) => void;
	reset: (overrideDelay?: number) => void;
	clear: () => void;
	isPending: () => boolean;
};

export function useTimeout(
	callback: () => void,
	delay = 0,
	options?: UseTimeoutOptions,
): UseTimeoutControls {
	const { enabled = true } = options ?? {};
	const preservedCallback = usePreservedCallback(callback);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clear = useCallback(() => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	const start = useCallback(
		(overrideDelay?: number) => {
			clear();
			timeoutRef.current = setTimeout(() => {
				timeoutRef.current = null;
				preservedCallback();
			}, overrideDelay ?? delay);
		},
		[clear, delay, preservedCallback],
	);

	const isPending = useCallback(() => timeoutRef.current !== null, []);

	useEffect(() => {
		if (!enabled) return;
		start();
		return clear;
	}, [enabled, start, clear]);

	useEffect(() => clear, [clear]);

	return { start, reset: start, clear, isPending };
}
