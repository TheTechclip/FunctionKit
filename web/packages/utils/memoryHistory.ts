export type MemoryHistoryDirection = "forward" | "backward" | "none";

export type MemoryHistoryNavigation = {
	direction: MemoryHistoryDirection;
	revision: number;
	position: number;
};

export type MemoryHistory<T> = {
	read: () => T;
	push: (value: T) => void;
	replace: (value: T) => void;
	reset: (value: T) => void;
	back: () => void;
	go: (delta: number) => void;
	subscribe: (listener: () => void) => () => void;
	getStack: () => readonly T[];
	getNavigation: () => MemoryHistoryNavigation;
};

/**
 * Framework-neutral in-memory navigation stack with forward-branch truncation
 * and a monotonic navigation revision.
 */
export function createMemoryHistory<T>(initial: T): MemoryHistory<T> {
	let index = 0;
	let stack = [initial];
	let navigation: MemoryHistoryNavigation = {
		direction: "none",
		revision: 0,
		position: 0,
	};
	const listeners = new Set<() => void>();

	const emit = () => {
		for (const listener of listeners) listener();
	};

	const setNavigation = (direction: MemoryHistoryDirection) => {
		navigation = {
			direction,
			revision: navigation.revision + 1,
			position: index,
		};
	};

	const go = (delta: number) => {
		const nextIndex = Math.min(Math.max(index + Math.trunc(delta), 0), stack.length - 1);
		if (nextIndex === index) return;
		index = nextIndex;
		setNavigation(nextIndex < navigation.position ? "backward" : "forward");
		emit();
	};

	return {
		read: () => stack[index],
		push: (value) => {
			stack = [...stack.slice(0, index + 1), value];
			index = stack.length - 1;
			setNavigation("forward");
			emit();
		},
		replace: (value) => {
			stack = stack.map((entry, entryIndex) => (entryIndex === index ? value : entry));
			setNavigation("none");
			emit();
		},
		reset: (value) => {
			stack = [value];
			index = 0;
			setNavigation("none");
			emit();
		},
		back: () => go(-1),
		go,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		getStack: () => stack,
		getNavigation: () => navigation,
	};
}
