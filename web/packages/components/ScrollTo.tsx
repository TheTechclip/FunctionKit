"use client";

import { useEffect } from "react";

export interface ScrollToProps {
	left?: number;
	top?: number;
	behavior?: ScrollBehavior;
	target?: React.RefObject<Element | null>;
}

export function ScrollTo({ left = 0, top = 0, behavior = "auto", target }: ScrollToProps) {
	useEffect(() => {
		const element = target?.current;
		if (element) {
			element.scrollTo({ left, top, behavior });
			return;
		}

		window.scrollTo({ left, top, behavior });
	}, [behavior, left, target, top]);

	return null;
}
