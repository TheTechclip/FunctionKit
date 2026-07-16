import type { Ref, RefCallback } from "react";

type ReactRef<T> = Ref<T> | undefined | null;

export function mergeRefs<T>(...refs: ReactRef<T>[]): RefCallback<T> {
	return (value: T | null) => {
		for (const ref of refs) {
			if (typeof ref === "function") {
				ref(value);
			} else if (ref && "current" in ref) {
				(ref as { current: T | null }).current = value;
			}
		}
	};
}
