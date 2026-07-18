"use client";

import { useEffect, useMemo } from "react";

import { debounce } from "../utils/debounce";
import { usePreservedCallback } from "./usePreservedCallback";

type DebounceOptions = {
	leading?: boolean;
	trailing?: boolean;
};

export function useDebounce<F extends (...args: unknown[]) => void>(
	callback: F,
	wait: number,
	options: DebounceOptions = {},
) {
	const preservedCallback = usePreservedCallback(callback);

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
