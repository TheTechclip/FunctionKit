"use client";

import { useCallback, useSyncExternalStore } from "react";
import { subscribeWindowResize, subscribeWindowScroll } from "../utils/browser/sharedBrowserEvents";

export function useCheckInvisible(className: string) {
	const subscribe = useCallback((listener: () => void) => {
		const unsubscribeScroll = subscribeWindowScroll(listener);
		const unsubscribeResize = subscribeWindowResize(listener);
		return () => {
			unsubscribeScroll();
			unsubscribeResize();
		};
	}, []);
	const getSnapshot = useCallback(() => {
		const element = document.querySelector(`.${CSS.escape(className)}`);
		return element ? element.getBoundingClientRect().top < 0 : false;
	}, [className]);
	const isInvisible = useSyncExternalStore(subscribe, getSnapshot, () => false);
	return { isInvisible };
}
