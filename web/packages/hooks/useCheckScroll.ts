"use client";

import { useSyncExternalStore } from "react";
import { subscribeWindowScroll } from "../utils/browser/sharedBrowserEvents";

function getScrollSnapshot() {
	return window.scrollY > 0;
}

export function useCheckScroll() {
	const isScrolled = useSyncExternalStore(subscribeWindowScroll, getScrollSnapshot, () => false);
	return { isScrolled };
}
