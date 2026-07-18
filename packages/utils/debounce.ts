export type DebounceEdge = "leading" | "trailing";

export type DebouncedFunction<F extends (...args: never[]) => unknown> = {
	(...args: Parameters<F>): void;
	cancel: () => void;
};

/**
 * Defers a callback until calls have stopped for `wait` milliseconds.
 * This utility has no React or browser dependency, so it is safe in RSC code.
 */
export function debounce<F extends (...args: never[]) => unknown>(
	callback: F,
	wait: number,
	{ edges = ["leading", "trailing"] }: { edges?: DebounceEdge[] } = {},
): DebouncedFunction<F> {
	let pendingThis: ThisParameterType<F> | undefined;
	let pendingArgs: Parameters<F> | undefined;
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	const leading = edges.includes("leading");
	const trailing = edges.includes("trailing");

	const cancel = () => {
		if (timeoutId !== undefined) clearTimeout(timeoutId);
		timeoutId = undefined;
		pendingThis = undefined;
		pendingArgs = undefined;
	};

	const invoke = () => {
		if (pendingArgs === undefined) return;
		callback.apply(pendingThis, pendingArgs);
		pendingThis = undefined;
		pendingArgs = undefined;
	};

	const debounced = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
		const isFirstCall = timeoutId === undefined;
		pendingThis = this;
		pendingArgs = args;

		if (timeoutId !== undefined) clearTimeout(timeoutId);
		timeoutId = setTimeout(
			() => {
				timeoutId = undefined;
				if (trailing) invoke();
				pendingThis = undefined;
				pendingArgs = undefined;
			},
			Math.max(0, wait),
		);

		if (leading && isFirstCall) invoke();
	} as DebouncedFunction<F>;

	debounced.cancel = cancel;
	return debounced;
}
