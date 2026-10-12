"use client";

import { useSyncExternalStore } from "react";
import { subscribeViewportResize } from "../utils/browser/sharedBrowserEvents";

function getViewportHeightSnapshot() {
	return window.visualViewport?.height ?? window.innerHeight;
}

export function useViewportHeight() {
	const height = useSyncExternalStore(subscribeViewportResize, getViewportHeightSnapshot, () => 0);
	return { height };
}
