"use client";

import { useCallback, useEffect, useRef } from "react";

export function usePreservedCallback<
	Arguments extends unknown[] = unknown[],
	ReturnValue = unknown,
>(callback: (...args: Arguments) => ReturnValue) {
	const callbackRef = useRef(callback);

	useEffect(
		function syncCallbackRef() {
			callbackRef.current = callback;
		},
		[callback],
	);

	return useCallback((...args: Arguments) => {
		return callbackRef.current(...args);
	}, []);
}
