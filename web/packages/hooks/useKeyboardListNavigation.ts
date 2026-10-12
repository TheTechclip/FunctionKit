"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isEditableKeyboardTarget } from "../utils/browser/isEditableKeyboardTarget";

const FIRST_ITEM_KEYS = new Set(["ArrowDown", "ArrowRight", "Home"]);
const LAST_ITEM_KEYS = new Set(["ArrowUp", "ArrowLeft", "End"]);
const isItemNeverDisabled = () => false;

export type KeyboardListItemPointerProps = {
	onPointerMove: (event: React.PointerEvent<Element>) => void;
	onPointerLeave: (event: React.PointerEvent<Element>) => void;
};

export type UseKeyboardListNavigationOptions = {
	/** Allow data-based navigation without mounted refs. Requires focusOnMove=false and a renderer that mounts and reveals the active index. Defaults to false. */
	allowUnmountedItems?: boolean;
	itemCount: number;
	activeIndex?: number;
	focusOnMove?: boolean;
	getItemTextValue?: (index: number) => string | undefined;
	isItemDisabled?: (index: number) => boolean;
	loop?: boolean;
	onActiveIndexChange?: (index: number) => void;
	typeahead?: boolean;
	typeaheadTimeout?: number;
};

export function useKeyboardListNavigation({
	itemCount,
	allowUnmountedItems = false,
	activeIndex: activeIndexProp,
	focusOnMove = true,
	getItemTextValue,
	isItemDisabled = isItemNeverDisabled,
	loop = true,
	onActiveIndexChange,
	typeahead = false,
	typeaheadTimeout = 500,
}: UseKeyboardListNavigationOptions) {
	const isActiveIndexControlled = activeIndexProp !== undefined;
	const [internalActiveIndex, setInternalActiveIndex] = useState(-1);
	const activeIndex = isActiveIndexControlled ? activeIndexProp : internalActiveIndex;
	const activeIndexRef = useRef(activeIndex);
	activeIndexRef.current = activeIndex;
	const itemCountRef = useRef(itemCount);
	itemCountRef.current = itemCount;
	/** Index to return to when a pointer-owned active item is released; null while the pointer owns nothing. */
	const pointerRestoreIndexRef = useRef<number | null>(null);
	const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);
	const commitActiveIndex = useCallback<React.Dispatch<React.SetStateAction<number>>>(
		(value) => {
			const nextValue = typeof value === "function" ? value(activeIndexRef.current) : value;
			if (nextValue === activeIndexRef.current) return;
			activeIndexRef.current = nextValue;
			if (!isActiveIndexControlled) setInternalActiveIndex(nextValue);
			onActiveIndexChange?.(nextValue);
		},
		[isActiveIndexControlled, onActiveIndexChange],
	);
	// Keyboard and programmatic changes take ownership from the pointer, so a later pointer leave never undoes them.
	const setActiveIndex = useCallback<React.Dispatch<React.SetStateAction<number>>>(
		(value) => {
			pointerRestoreIndexRef.current = null;
			commitActiveIndex(value);
		},
		[commitActiveIndex],
	);
	const itemRefs = useRef<(HTMLElement | null)[]>([]);
	const typeaheadBufferRef = useRef("");
	const typeaheadTimerRef = useRef<number | null>(null);

	const setItemRef = useCallback((index: number, element: HTMLElement | null) => {
		itemRefs.current[index] = element;
	}, []);

	const isItemAvailable = useCallback(
		(index: number) =>
			index >= 0 &&
			index < itemCount &&
			!isItemDisabled(index) &&
			((allowUnmountedItems && !focusOnMove) ||
				(itemRefs.current[index] !== null && itemRefs.current[index] !== undefined)),
		[allowUnmountedItems, focusOnMove, isItemDisabled, itemCount],
	);

	const activateItem = useCallback(
		(index: number, shouldFocus: boolean) => {
			if (!isItemAvailable(index)) return false;
			const target = itemRefs.current[index];

			setActiveIndex(index);
			if (shouldFocus) {
				target?.focus();
			}
			target?.scrollIntoView({
				block: "nearest",
				inline: "nearest",
			});
			return true;
		},
		[isItemAvailable, setActiveIndex],
	);

	const focusItem = useCallback((index: number) => activateItem(index, true), [activateItem]);

	const findAvailableIndex = useCallback(
		(start: number, direction: 1 | -1, includeStart = false) => {
			let index = includeStart ? start : start + direction;
			for (let visited = 0; visited < itemCount; visited += 1) {
				if (index < 0 || index >= itemCount) {
					if (!loop) return -1;
					index = index < 0 ? itemCount - 1 : 0;
				}
				if (isItemAvailable(index)) return index;
				index += direction;
			}
			return -1;
		},
		[isItemAvailable, itemCount, loop],
	);

	const focusBoundaryItem = useCallback(
		(key: string) => {
			if (itemCount === 0) return false;
			const index = FIRST_ITEM_KEYS.has(key)
				? findAvailableIndex(0, 1, true)
				: LAST_ITEM_KEYS.has(key)
					? findAvailableIndex(itemCount - 1, -1, true)
					: -1;
			return index >= 0 ? focusItem(index) : false;
		},
		[findAvailableIndex, focusItem, itemCount],
	);

	const moveActiveItem = useCallback(
		(key: string) => {
			if (itemCount === 0) return false;

			if (key === "ArrowDown" || key === "ArrowRight") {
				const nextIndex = findAvailableIndex(activeIndex < 0 ? -1 : activeIndex, 1);
				return activateItem(nextIndex, focusOnMove);
			}

			if (key === "ArrowUp" || key === "ArrowLeft") {
				const nextIndex = findAvailableIndex(activeIndex < 0 ? itemCount : activeIndex, -1);
				return activateItem(nextIndex, focusOnMove);
			}

			if (FIRST_ITEM_KEYS.has(key)) {
				const nextIndex = findAvailableIndex(0, 1, true);
				return activateItem(nextIndex, focusOnMove);
			}

			if (LAST_ITEM_KEYS.has(key)) {
				const nextIndex = findAvailableIndex(itemCount - 1, -1, true);
				return activateItem(nextIndex, focusOnMove);
			}

			return false;
		},
		[activeIndex, activateItem, findAvailableIndex, focusOnMove, itemCount],
	);

	const getItemPointerProps = useCallback(
		(
			index: number,
			{ disabled = false }: { disabled?: boolean } = {},
		): KeyboardListItemPointerProps => ({
			onPointerMove: (event) => {
				if (disabled || event.pointerType === "touch") return;
				// Layout shifts and scrolling under a resting pointer must not move the active item.
				const previous = pointerPositionRef.current;
				if (previous && previous.x === event.clientX && previous.y === event.clientY) return;
				pointerPositionRef.current = { x: event.clientX, y: event.clientY };
				if (index === activeIndexRef.current) return;
				if (pointerRestoreIndexRef.current === null) {
					pointerRestoreIndexRef.current = activeIndexRef.current;
				}
				commitActiveIndex(index);
			},
			onPointerLeave: (event) => {
				const restoreIndex = pointerRestoreIndexRef.current;
				if (restoreIndex === null || activeIndexRef.current !== index) return;
				const next = event.relatedTarget;
				if (next instanceof Node && itemRefs.current.some((element) => element?.contains(next))) {
					return;
				}
				pointerRestoreIndexRef.current = null;
				commitActiveIndex(restoreIndex < itemCountRef.current ? restoreIndex : -1);
			},
		}),
		[commitActiveIndex],
	);

	const clickActiveItem = useCallback(() => {
		if (activeIndex < 0) {
			return false;
		}

		if (!isItemAvailable(activeIndex) || !itemRefs.current[activeIndex]) return false;
		itemRefs.current[activeIndex]?.click();
		return true;
	}, [activeIndex, isItemAvailable]);

	const moveByTypeahead = useCallback(
		(key: string) => {
			if (!typeahead || itemCount === 0) return false;
			if (typeaheadTimerRef.current !== null) {
				window.clearTimeout(typeaheadTimerRef.current);
			}
			const previous = typeaheadBufferRef.current;
			const normalizedKey = key.toLocaleLowerCase();
			const repeatsOneCharacter =
				previous.length > 0 && [...previous].every((character) => character === normalizedKey);
			const query = repeatsOneCharacter ? normalizedKey : `${previous}${normalizedKey}`;
			typeaheadBufferRef.current = query;
			typeaheadTimerRef.current = window.setTimeout(() => {
				typeaheadBufferRef.current = "";
				typeaheadTimerRef.current = null;
			}, typeaheadTimeout);

			let index = activeIndex;
			for (let visited = 0; visited < itemCount; visited += 1) {
				index += 1;
				if (index >= itemCount) index = 0;
				if (!isItemAvailable(index)) continue;
				const textValue = getItemTextValue?.(index) ?? itemRefs.current[index]?.textContent ?? "";
				if (textValue.trim().toLocaleLowerCase().startsWith(query)) {
					return activateItem(index, focusOnMove);
				}
			}
			return false;
		},
		[
			activeIndex,
			activateItem,
			focusOnMove,
			getItemTextValue,
			isItemAvailable,
			itemCount,
			typeahead,
			typeaheadTimeout,
		],
	);

	const handleListKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLElement>, options?: { container?: HTMLElement | null }) => {
			if (itemCount === 0 || event.defaultPrevented) {
				return;
			}

			const target = event.target as HTMLElement | null;

			if (!target) {
				return;
			}

			if (isEditableKeyboardTarget(target)) {
				return;
			}

			if (options?.container && !options.container.contains(target)) {
				return;
			}

			if (event.key === "Escape") {
				typeaheadBufferRef.current = "";
				setActiveIndex(-1);
				return;
			}

			const isPrintableCharacter =
				event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey;
			if (isPrintableCharacter && moveByTypeahead(event.key)) {
				event.preventDefault();
				return;
			}

			if (
				event.key === "Enter" ||
				event.key === " " ||
				event.key === "ArrowDown" ||
				event.key === "ArrowUp" ||
				event.key === "ArrowLeft" ||
				event.key === "ArrowRight" ||
				event.key === "Home" ||
				event.key === "End"
			) {
				event.preventDefault();
			}

			if (event.key === "Enter" || event.key === " ") {
				clickActiveItem();
				return;
			}

			moveActiveItem(event.key);
		},
		[clickActiveItem, moveActiveItem, moveByTypeahead, itemCount, setActiveIndex],
	);

	useEffect(() => {
		itemRefs.current = itemRefs.current.slice(0, itemCount);
		commitActiveIndex((currentIndex) => {
			if (itemCount === 0) return -1;
			return currentIndex >= itemCount ? itemCount - 1 : currentIndex;
		});
	}, [itemCount, commitActiveIndex]);

	useEffect(
		() => () => {
			if (typeaheadTimerRef.current !== null) {
				window.clearTimeout(typeaheadTimerRef.current);
			}
		},
		[],
	);

	return {
		activeIndex,
		setActiveIndex,
		setItemRef,
		getItemPointerProps,
		clickActiveItem,
		focusBoundaryItem,
		moveActiveItem,
		moveByTypeahead,
		handleListKeyDown,
	};
}
