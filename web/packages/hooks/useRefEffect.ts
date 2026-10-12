"use client";

import { type DependencyList, useCallback, useInsertionEffect, useRef } from "react";

export type CleanupCallback = () => void;

export function useRefEffect<RefElement extends HTMLElement = HTMLElement>(
	// biome-ignore lint/suspicious/noConfusingVoidType: callbacks may intentionally omit cleanup.
	callback: (element: RefElement) => CleanupCallback | void,
	deps: DependencyList,
): (element: RefElement | null) => void {
	const callbackRef = useRef(callback);
	useInsertionEffect(() => {
		callbackRef.current = callback;
	});
	const cleanupCallbackRef = useRef<CleanupCallback>(() => {});

	const effect = useCallback((element: RefElement | null) => {
		cleanupCallbackRef.current();
		cleanupCallbackRef.current = () => {};

		if (element == null) {
			return;
		}

		const cleanup = callbackRef.current(element);

		if (typeof cleanup === "function") {
			cleanupCallbackRef.current = cleanup;
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: callers explicitly own setup dependencies, like an effect.
	}, deps);

	return effect;
}
