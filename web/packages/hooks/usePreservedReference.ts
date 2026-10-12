"use client";

import { useMemo, useRef } from "react";

function areDeeplyEqual<T>(a: T, b: T): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

export function usePreservedReference<T>(
	value: T,
	areValuesEqual: (a: T, b: T) => boolean = areDeeplyEqual,
): T {
	const ref = useRef(value);

	return useMemo(() => {
		if (!areValuesEqual(ref.current, value)) {
			ref.current = value;
		}
		return ref.current;
	}, [areValuesEqual, value]);
}
