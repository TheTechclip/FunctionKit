"use client";

import {
	subscribeVisualViewportResize,
	subscribeVisualViewportScroll,
} from "./sharedBrowserEvents";

type SubscribeKeyboardHeightOptions = {
	callback: (height: number) => void;
	immediate?: boolean;
	throttleMs?: number;
};

export function subscribeKeyboardHeight({
	callback,
	immediate = false,
	throttleMs = 16,
}: SubscribeKeyboardHeightOptions) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let disposed = false;
	let lastHeight = 0;
	let latestHeight = 0;

	const notify = (height: number) => {
		latestHeight = height;
		if (timer !== undefined) return;

		const run = () => {
			timer = undefined;
			if (latestHeight !== lastHeight) {
				lastHeight = latestHeight;
				callback(latestHeight);
			}
		};

		if (throttleMs > 0) {
			timer = setTimeout(run, throttleMs);
		} else {
			run();
		}
	};

	const handleResize = () => {
		if (disposed) return;
		const vv = window.visualViewport;
		if (!vv) return;
		const diff = window.innerHeight - vv.height;
		notify(diff > 0 ? diff : 0);
	};

	if (immediate) handleResize();

	const unsubscribeResize = subscribeVisualViewportResize(handleResize);
	const unsubscribeScroll = subscribeVisualViewportScroll(handleResize);

	return {
		unsubscribe() {
			disposed = true;
			if (timer !== undefined) {
				clearTimeout(timer);
				timer = undefined;
			}
			unsubscribeResize();
			unsubscribeScroll();
		},
	};
}
