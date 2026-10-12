import type { Ref, RefCallback } from "react";

type ReactRef<T> = Ref<T> | undefined | null;

export function mergeRefs<T>(...refs: ReactRef<T>[]): RefCallback<T> {
	let detach: (() => void) | undefined;

	return (value: T | null) => {
		detach?.();
		if (value === null) return;

		const cleanups: Array<() => void> = [];
		for (const ref of refs) {
			if (typeof ref === "function") {
				const cleanup = ref(value);
				cleanups.push(typeof cleanup === "function" ? cleanup : () => ref(null));
			} else if (ref) {
				ref.current = value;
				cleanups.push(() => {
					if (ref.current === value) ref.current = null;
				});
			}
		}

		let attached = true;
		detach = () => {
			if (!attached) return;
			attached = false;
			for (const cleanup of cleanups) cleanup();
		};
		return detach;
	};
}
