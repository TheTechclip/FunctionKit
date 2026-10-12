"use client";

import { useState } from "react";

interface UseControllableStateOptions<T> {
	value?: T;
	defaultValue: T;
}

export function useControllableState<T>({ value, defaultValue }: UseControllableStateOptions<T>) {
	const [internalValue, setInternalValue] = useState(defaultValue);
	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : internalValue;

	const setValue = (nextValue: T | ((prevValue: T) => T)) => {
		if (isControlled) return;

		setInternalValue((prevValue) =>
			typeof nextValue === "function" ? (nextValue as (prevValue: T) => T)(prevValue) : nextValue,
		);
	};

	return [currentValue, setValue, isControlled] as const;
}
