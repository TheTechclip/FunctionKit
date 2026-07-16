"use client";

import { useEffect, useMemo } from "react";

import { usePreservedCallback } from "./usePreservedCallback";

export function debounce<F extends (...args: unknown[]) => void>(
	func: F,
	debounceMs: number,
	{
		edges = ["leading", "trailing"],
	}: { edges?: Array<"leading" | "trailing"> } = {},
): {
	(...args: Parameters<F>): void;
	cancel: () => void;
} {
	let pendingThis: ThisParameterType<F> | undefined;
	let pendingArgs: Parameters<F> | null = null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const leading = edges.includes("leading");
	const trailing = edges.includes("trailing");

	const invoke = () => {
		if (pendingArgs !== null) {
			func.apply(pendingThis, pendingArgs);
			pendingThis = undefined;
			pendingArgs = null;
		}
	};

	const cancelTimer = () => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	const cancel = () => {
		cancelTimer();
		pendingThis = undefined;
		pendingArgs = null;
	};

	const schedule = () => {
		cancelTimer();
		timeoutId = setTimeout(() => {
			timeoutId = null;
			if (trailing) invoke();
			cancel();
		}, debounceMs);
	};

	const debounced = function (
		this: ThisParameterType<F>,
		...args: Parameters<F>
	) {
		pendingThis = this;
		pendingArgs = args;

		const isFirstCall = timeoutId == null;

		schedule();

		if (leading && isFirstCall) {
			invoke();
		}
	} as {
		(...args: Parameters<F>): void;
		cancel: () => void;
	};

	debounced.cancel = cancel;
	return debounced;
}

type DebounceOptions = {
	leading?: boolean;
	trailing?: boolean;
};

export function useDebounce<F extends (...args: unknown[]) => void>(
	callback: F,
	wait: number,
	options: DebounceOptions = {},
) {
	const preservedCallback = usePreservedCallback(callback) as F;

	const { leading = false, trailing = true } = options;

	const edges = useMemo(() => {
		const _edges: Array<"leading" | "trailing"> = [];
		if (leading) {
			_edges.push("leading");
		}

		if (trailing) {
			_edges.push("trailing");
		}

		return _edges;
	}, [leading, trailing]);

	const debounced = useMemo(() => {
		return debounce(preservedCallback, wait, { edges });
	}, [preservedCallback, wait, edges]);

	useEffect(
		function cancelDebouncedOnUnmount() {
			return () => {
				debounced.cancel();
			};
		},
		[debounced],
	);

	return debounced;
}
