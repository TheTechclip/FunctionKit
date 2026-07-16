"use client";

import { useEffect, useState } from "react";

export function useViewportMatch(mediaQuery: string): boolean {
	const [isMatched, setIsMatched] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const mediaQueryList = window.matchMedia(mediaQuery);
		const syncMatchState = () => {
			setIsMatched(mediaQueryList.matches);
		};

		syncMatchState();
		mediaQueryList.addEventListener("change", syncMatchState);

		return () => {
			mediaQueryList.removeEventListener("change", syncMatchState);
		};
	}, [mediaQuery]);

	return isMatched;
}
