"use client";

import { type DependencyList, useCallback, useRef } from "react";

import { usePreservedCallback } from "./usePreservedCallback";

export type CleanupCallback = () => void;

export function useRefEffect<RefElement extends HTMLElement = HTMLElement>(
	// biome-ignore lint/suspicious/noConfusingVoidType: callbacks may intentionally omit cleanup.
	callback: (element: RefElement) => CleanupCallback | void,
	deps: DependencyList,
): (element: RefElement | null) => void {
	const preservedCallback = usePreservedCallback(callback);
	const cleanupCallbackRef = useRef<CleanupCallback>(() => {});

	const effect = useCallback(
		(element: RefElement | null) => {
			cleanupCallbackRef.current();
			cleanupCallbackRef.current = () => {};

			if (element == null) {
				return;
			}

			const cleanup = preservedCallback(element);

			if (typeof cleanup === "function") {
				cleanupCallbackRef.current = cleanup;
			}
		},
		[preservedCallback, ...deps],
	);

	return effect;
}
