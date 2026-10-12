"use client";

import { useEffect } from "react";

let bodyScrollLockCount = 0;
let bodyScrollTouchStartY = 0;

type BodyScrollLockSnapshot = {
	overflow: string;
	overscrollBehavior: string;
	documentOverflow: string;
	documentOverscrollBehavior: string;
};

let originalBodyStyles: BodyScrollLockSnapshot | null = null;

function getScrollableAncestor(target: EventTarget | null) {
	if (!(target instanceof Element)) return null;

	let element: Element | null = target;
	while (element && element !== document.body) {
		if (element instanceof HTMLElement) {
			const style = window.getComputedStyle(element);
			const canScrollY =
				/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight;

			if (canScrollY) return element;
		}

		element = element.parentElement;
	}

	return null;
}

function handleBodyScrollTouchStart(event: TouchEvent) {
	bodyScrollTouchStartY = event.touches[0]?.clientY ?? 0;
}

function handleBodyScrollTouchMove(event: TouchEvent) {
	const currentY = event.touches[0]?.clientY ?? bodyScrollTouchStartY;
	const deltaY = currentY - bodyScrollTouchStartY;
	const scrollable = getScrollableAncestor(event.target);

	if (!scrollable) {
		event.preventDefault();
		return;
	}

	const isAtTop = scrollable.scrollTop <= 0;
	const isAtBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight;

	if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
		event.preventDefault();
	}
}

function acquireBodyScrollLock() {
	const body = document.body;
	const root = document.documentElement;

	if (bodyScrollLockCount === 0) {
		originalBodyStyles = {
			overflow: body.style.overflow,
			overscrollBehavior: body.style.overscrollBehavior,
			documentOverflow: root.style.overflow,
			documentOverscrollBehavior: root.style.overscrollBehavior,
		};

		body.style.overflow = "hidden";
		body.style.overscrollBehavior = "none";
		root.style.overflow = "hidden";
		root.style.overscrollBehavior = "none";
		document.addEventListener("touchstart", handleBodyScrollTouchStart, {
			passive: true,
		});
		document.addEventListener("touchmove", handleBodyScrollTouchMove, {
			passive: false,
		});
	}

	bodyScrollLockCount += 1;
}

function releaseBodyScrollLock() {
	if (bodyScrollLockCount === 0) return;

	bodyScrollLockCount -= 1;
	if (bodyScrollLockCount > 0) return;

	const body = document.body;
	const root = document.documentElement;
	const snapshot = originalBodyStyles as BodyScrollLockSnapshot;

	document.removeEventListener("touchstart", handleBodyScrollTouchStart);
	document.removeEventListener("touchmove", handleBodyScrollTouchMove);
	originalBodyStyles = null;

	body.style.overflow = snapshot.overflow;
	body.style.overscrollBehavior = snapshot.overscrollBehavior;
	root.style.overflow = snapshot.documentOverflow;
	root.style.overscrollBehavior = snapshot.documentOverscrollBehavior;
}

export function useScrollLock(locked = true) {
	useEffect(() => {
		if (!locked) return;

		acquireBodyScrollLock();

		return () => {
			releaseBodyScrollLock();
		};
	}, [locked]);

	return {
		lockScroll: acquireBodyScrollLock,
		openScroll: releaseBodyScrollLock,
	};
}
