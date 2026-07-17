"use client";

import { useEffect, useRef } from "react";

import { usePreservedCallback } from "./usePreservedCallback";

type IntervalOptions =
	| number
	| {
			delay: number;
			immediate?: boolean;
			enabled?: boolean;
	  };

export function useInterval(callback: () => void, options: IntervalOptions) {
	const delay = typeof options === "number" ? options : options.delay;
	const immediate = typeof options === "number" ? false : options.immediate;
	const enabled = typeof options === "number" ? true : (options.enabled ?? true);

	const preservedCallback = usePreservedCallback(callback);
	const immediateCalledRef = useRef(false);

	useEffect(
		function runImmediateCallback() {
			if (immediate !== true) {
				immediateCalledRef.current = false;
				return;
			}

			if (!enabled) {
				return;
			}

			if (immediateCalledRef.current) {
				return;
			}

			immediateCalledRef.current = true;
			preservedCallback();
		},
		[immediate, preservedCallback, enabled],
	);

	useEffect(
		function startInterval() {
			if (!enabled) {
				return;
			}

			const id = setInterval(preservedCallback, delay);
			return () => clearInterval(id);
		},
		[delay, preservedCallback, enabled],
	);
}
