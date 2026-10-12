"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePreservedCallback } from "./usePreservedCallback";

type ObserverRegistration = {
	callback: (entry: IntersectionObserverEntry) => void;
};

type ObserverBucket = {
	observer: IntersectionObserver;
	registrations: Map<Element, Set<ObserverRegistration>>;
};

const emptyOptions: IntersectionObserverInit = {};
const observerBuckets = new Map<string, ObserverBucket>();
const rootIds = new WeakMap<object, number>();
let nextRootId = 1;
let lastIntersectionObserverConstructor: typeof IntersectionObserver | undefined;

function getRootId(root: object | null | undefined): string {
	if (root == null) return "viewport";
	const existing = rootIds.get(root);
	if (existing !== undefined) return String(existing);
	const id = nextRootId++;
	rootIds.set(root, id);
	return String(id);
}

function getObserverKey(options: IntersectionObserverInit): string {
	const rootKey = getRootId(options.root);
	const optionEntries = Object.entries(options)
		.filter(([key]) => key !== "root")
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([key, value]) => `${key}:${JSON.stringify(value)}`)
		.join("|");
	return `${rootKey}|${optionEntries}`;
}

function registerObserver(
	element: Element,
	callback: ObserverRegistration["callback"],
	options: IntersectionObserverInit,
) {
	if (lastIntersectionObserverConstructor !== IntersectionObserver) {
		for (const bucket of observerBuckets.values()) bucket.observer.disconnect();
		observerBuckets.clear();
		lastIntersectionObserverConstructor = IntersectionObserver;
	}
	const key = getObserverKey(options);
	let bucket = observerBuckets.get(key);
	if (!bucket) {
		const registrations = new Map<Element, Set<ObserverRegistration>>();
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				for (const registration of registrations.get(entry.target) ?? []) {
					registration.callback(entry);
				}
			}
		}, options);
		bucket = { observer, registrations };
		observerBuckets.set(key, bucket);
	}

	const observerBucket = bucket;
	let elementRegistrations = observerBucket.registrations.get(element);
	if (!elementRegistrations) {
		elementRegistrations = new Set();
		observerBucket.registrations.set(element, elementRegistrations);
		observerBucket.observer.observe(element);
	}
	const registration: ObserverRegistration = { callback };
	elementRegistrations.add(registration);

	return () => {
		const currentRegistrations = observerBucket.registrations.get(
			element,
		) as Set<ObserverRegistration>;
		currentRegistrations.delete(registration);
		if (currentRegistrations.size > 0) return;
		observerBucket.registrations.delete(element);
		observerBucket.observer.unobserve(element);
		if (observerBucket.registrations.size === 0) {
			observerBucket.observer.disconnect();
			observerBuckets.delete(key);
		}
	};
}

export function useIntersectionObserver<Element extends HTMLElement>(
	callback: (entry: IntersectionObserverEntry) => void,
	options?: IntersectionObserverInit,
): (element: Element | null) => void {
	const preservedCallback = usePreservedCallback(callback);
	const observerOptionKey = getObserverKey(options ?? emptyOptions);
	const observerOptionsRef = useRef<
		| {
				key: string;
				options: IntersectionObserverInit;
		  }
		| undefined
	>(undefined);
	if (observerOptionsRef.current?.key !== observerOptionKey) {
		observerOptionsRef.current = {
			key: observerOptionKey,
			options: options ?? emptyOptions,
		};
	}
	const observerOptions = observerOptionsRef.current.options;
	const cleanupRef = useRef<(() => void) | null>(null);

	const observe = useCallback(
		(element: Element | null) => {
			cleanupRef.current?.();
			cleanupRef.current = null;
			if (element == null || typeof IntersectionObserver === "undefined") return;
			cleanupRef.current = registerObserver(element, preservedCallback, observerOptions);
		},
		[observerOptions, preservedCallback],
	);

	useEffect(
		() => () => {
			cleanupRef.current?.();
			cleanupRef.current = null;
		},
		[],
	);

	return observe;
}
