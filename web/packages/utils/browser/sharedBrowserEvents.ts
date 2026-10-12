"use client";

export type SharedBrowserEventListener = (event: Event) => void;

export type ViewportScrollSubscriptionOptions = {
	window?: boolean;
	windowCapture?: boolean;
	visual?: boolean;
};

export type ViewportGeometrySubscriptionOptions = {
	windowScroll?: boolean;
	windowScrollCapture?: boolean;
	orientation?: boolean;
};

type SharedBrowserChannel = {
	target: EventTarget;
	eventName: string;
	options?: boolean | AddEventListenerOptions;
	listeners: Set<{ listener: SharedBrowserEventListener }>;
	dispatch: EventListener;
};

const channels = new Map<string, SharedBrowserChannel>();

function subscribeSharedBrowserEvent(
	key: string,
	target: EventTarget | null | undefined,
	eventName: string,
	listener: SharedBrowserEventListener,
	options?: boolean | AddEventListenerOptions,
) {
	if (!target) return () => {};

	let channel = channels.get(key);
	if (channel && channel.target !== target) {
		if (channel.options === undefined) {
			channel.target.removeEventListener(channel.eventName, channel.dispatch);
		} else {
			channel.target.removeEventListener(channel.eventName, channel.dispatch, channel.options);
		}
		channels.delete(key);
		channel = undefined;
	}

	if (!channel) {
		const listeners = new Set<{ listener: SharedBrowserEventListener }>();
		channel = {
			target,
			eventName,
			options,
			listeners,
			dispatch: (event) => {
				for (const { listener: current } of Array.from(listeners)) current(event);
			},
		};
		channels.set(key, channel);
		if (options === undefined) target.addEventListener(eventName, channel.dispatch);
		else target.addEventListener(eventName, channel.dispatch, options);
	}

	const registration = { listener };
	const subscribedChannel = channel;
	subscribedChannel.listeners.add(registration);
	return () => {
		const current = subscribedChannel;
		if (!current.listeners.delete(registration)) return;
		if (current.listeners.size > 0 || channels.get(key) !== current) return;
		if (current.options === undefined) {
			current.target.removeEventListener(current.eventName, current.dispatch);
		} else {
			current.target.removeEventListener(current.eventName, current.dispatch, current.options);
		}
		channels.delete(key);
	};
}

function combineUnsubscribers(unsubscribers: Array<() => void>) {
	return () => {
		for (const unsubscribe of unsubscribers) unsubscribe();
	};
}

export function subscribeWindowResize(listener: SharedBrowserEventListener) {
	return subscribeSharedBrowserEvent(
		"window:resize",
		typeof window === "undefined" ? null : window,
		"resize",
		listener,
	);
}

export function subscribeWindowScroll(listener: SharedBrowserEventListener, capture = false) {
	return subscribeSharedBrowserEvent(
		`window:scroll:${capture ? "capture" : "bubble"}`,
		typeof window === "undefined" ? null : window,
		"scroll",
		listener,
		capture || undefined,
	);
}

export function subscribeVisualViewportResize(listener: SharedBrowserEventListener) {
	return subscribeSharedBrowserEvent(
		"visualViewport:resize",
		typeof window === "undefined" ? null : window.visualViewport,
		"resize",
		listener,
	);
}

export function subscribeVisualViewportScroll(listener: SharedBrowserEventListener) {
	return subscribeSharedBrowserEvent(
		"visualViewport:scroll",
		typeof window === "undefined" ? null : window.visualViewport,
		"scroll",
		listener,
	);
}

export function subscribeViewportResize(listener: SharedBrowserEventListener) {
	return combineUnsubscribers([
		subscribeWindowResize(listener),
		subscribeVisualViewportResize(listener),
	]);
}

export function subscribeViewportScroll(
	listener: SharedBrowserEventListener,
	options: ViewportScrollSubscriptionOptions = {},
) {
	if (typeof window === "undefined") return () => {};
	const { window: includeWindow = false, windowCapture = false, visual = true } = options;
	const unsubscribers: Array<() => void> = [];
	if (includeWindow) {
		unsubscribers.push(subscribeWindowScroll(listener, windowCapture));
	}
	if (visual) {
		unsubscribers.push(subscribeVisualViewportScroll(listener));
	}
	return combineUnsubscribers(unsubscribers);
}

export function subscribeViewportGeometry(
	listener: SharedBrowserEventListener,
	options: ViewportGeometrySubscriptionOptions = {},
) {
	if (typeof window === "undefined") return () => {};
	const unsubscribers = [
		subscribeViewportResize(listener),
		subscribeViewportScroll(listener, {
			window: options.windowScroll,
			windowCapture: options.windowScrollCapture,
			visual: true,
		}),
	];
	if (options.orientation) {
		unsubscribers.push(
			subscribeSharedBrowserEvent(
				"window:orientationchange",
				window,
				"orientationchange",
				listener,
			),
		);
	}
	return combineUnsubscribers(unsubscribers);
}
