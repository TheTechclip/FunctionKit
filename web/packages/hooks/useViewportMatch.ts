"use client";

import { useCallback, useSyncExternalStore } from "react";

type MediaQueryStore = {
	mediaQuery: MediaQueryList;
	listeners: Set<() => void>;
	handleChange: () => void;
};

const mediaQueryStores = new Map<string, MediaQueryStore>();
let storeMatchMedia: typeof window.matchMedia | undefined;

function resetMediaQueryStores() {
	for (const store of mediaQueryStores.values()) {
		store.mediaQuery.removeEventListener("change", store.handleChange);
	}
	mediaQueryStores.clear();
}

function getMediaQueryStore(query: string): MediaQueryStore | undefined {
	if (!window.matchMedia) return undefined;

	if (storeMatchMedia !== window.matchMedia) {
		resetMediaQueryStores();
		storeMatchMedia = window.matchMedia;
	}

	const existing = mediaQueryStores.get(query);
	if (existing) return existing;

	const listeners = new Set<() => void>();
	const store: MediaQueryStore = {
		mediaQuery: window.matchMedia(query),
		listeners,
		handleChange: () => {
			for (const listener of listeners) listener();
		},
	};
	mediaQueryStores.set(query, store);
	return store;
}

function subscribeMediaQuery(query: string, listener: () => void) {
	const store = getMediaQueryStore(query);
	if (!store) return () => {};

	if (store.listeners.size === 0) {
		store.mediaQuery.addEventListener("change", store.handleChange);
	}
	store.listeners.add(listener);

	return () => {
		store.listeners.delete(listener);
		if (store.listeners.size > 0) return;
		store.mediaQuery.removeEventListener("change", store.handleChange);
		mediaQueryStores.delete(query);
	};
}

function getMediaQuerySnapshot(query: string) {
	return getMediaQueryStore(query)?.mediaQuery.matches ?? false;
}

export function useViewportMatch(mediaQuery: string): boolean {
	const subscribe = useCallback(
		(listener: () => void) => subscribeMediaQuery(mediaQuery, listener),
		[mediaQuery],
	);
	const getSnapshot = useCallback(() => getMediaQuerySnapshot(mediaQuery), [mediaQuery]);

	return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
