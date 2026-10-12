"use client";

import { type Key, useCallback, useEffect, useMemo, useRef, useState } from "react";

export type CollectionSelectionMode = "none" | "single" | "multiple";
export type CollectionSelectionBehavior = "toggle" | "replace";

export interface CollectionSelectionIntent {
	extend?: boolean;
	toggle?: boolean;
}

export interface UseCollectionSelectionOptions<K extends Key> {
	keys: readonly K[];
	selectionMode?: CollectionSelectionMode;
	selectionBehavior?: CollectionSelectionBehavior;
	selectedKeys?: Iterable<K>;
	defaultSelectedKeys?: Iterable<K>;
	disabledKeys?: Iterable<K>;
	disallowEmptySelection?: boolean;
	onSelectionChange?: (keys: ReadonlySet<K>) => void;
}

const setsEqual = <K>(left: ReadonlySet<K>, right: ReadonlySet<K>) => {
	if (left.size !== right.size) return false;
	for (const value of left) {
		if (!right.has(value)) return false;
	}
	return true;
};

export function useCollectionSelection<K extends Key>({
	keys,
	selectionMode = "none",
	selectionBehavior = "toggle",
	selectedKeys,
	defaultSelectedKeys,
	disabledKeys,
	disallowEmptySelection = false,
	onSelectionChange,
}: UseCollectionSelectionOptions<K>) {
	const isControlled = selectedKeys !== undefined;
	const disabledKeySet = useMemo(() => new Set(disabledKeys), [disabledKeys]);
	const keySet = useMemo(() => new Set(keys), [keys]);
	const keyIndex = useMemo(() => new Map(keys.map((key, index) => [key, index])), [keys]);
	const availableKeys = useMemo(
		() => keys.filter((key) => !disabledKeySet.has(key)),
		[keys, disabledKeySet],
	);
	const normalize = useCallback(
		(values?: Iterable<K>) => {
			if (selectionMode === "none") return new Set<K>();
			const normalized = new Set<K>();
			for (const key of values ?? []) {
				if (!keySet.has(key) || disabledKeySet.has(key)) continue;
				normalized.add(key);
				if (selectionMode === "single") break;
			}
			return normalized;
		},
		[disabledKeySet, keySet, selectionMode],
	);
	const controlledSelection = useMemo(() => normalize(selectedKeys), [normalize, selectedKeys]);
	const [internalSelection, setInternalSelection] = useState<Set<K>>(() =>
		normalize(defaultSelectedKeys),
	);
	const currentSelection = isControlled ? controlledSelection : internalSelection;
	const selectionRef = useRef(currentSelection);
	selectionRef.current = currentSelection;
	const anchorKeyRef = useRef<K | null>(null);

	const commit = useCallback(
		(nextSelection: Set<K>) => {
			const normalized = normalize(nextSelection);
			if (setsEqual(selectionRef.current, normalized)) return false;
			if (!isControlled) {
				setInternalSelection(normalized);
				selectionRef.current = normalized;
			}
			onSelectionChange?.(normalized);
			return true;
		},
		[isControlled, normalize, onSelectionChange],
	);

	const select = useCallback(
		(key: K, intent: CollectionSelectionIntent = {}) => {
			if (selectionMode === "none" || !keySet.has(key) || disabledKeySet.has(key)) return false;
			const current = selectionRef.current;
			if (selectionMode === "single") {
				const canClear =
					!disallowEmptySelection &&
					current.has(key) &&
					(selectionBehavior === "toggle" || intent.toggle);
				anchorKeyRef.current = key;
				return commit(canClear ? new Set<K>() : new Set([key]));
			}

			if (intent.extend && anchorKeyRef.current !== null) {
				const anchorIndex = keyIndex.get(anchorKeyRef.current);
				const selectedKeyIndex = keys.indexOf(key);
				if (anchorIndex !== undefined) {
					const start = Math.min(anchorIndex, selectedKeyIndex);
					const end = Math.max(anchorIndex, selectedKeyIndex);
					const next = intent.toggle ? new Set(current) : new Set<K>();
					for (const rangeKey of keys.slice(start, end + 1)) {
						if (!disabledKeySet.has(rangeKey)) next.add(rangeKey);
					}
					return commit(next);
				}
			}

			anchorKeyRef.current = key;
			if (selectionBehavior === "replace" && !intent.toggle) {
				return commit(new Set([key]));
			}
			const next = new Set(current);
			if (next.has(key)) {
				if (!disallowEmptySelection || next.size > 1) next.delete(key);
			} else {
				next.add(key);
			}
			return commit(next);
		},
		[
			commit,
			disabledKeySet,
			disallowEmptySelection,
			keyIndex,
			keySet,
			keys,
			selectionBehavior,
			selectionMode,
		],
	);

	const replace = useCallback(
		(key: K) => {
			if (selectionMode === "none" || !keySet.has(key) || disabledKeySet.has(key)) return false;
			anchorKeyRef.current = key;
			return commit(new Set([key]));
		},
		[commit, disabledKeySet, keySet, selectionMode],
	);

	const clear = useCallback(() => {
		if (selectionMode === "none" || disallowEmptySelection) return false;
		anchorKeyRef.current = null;
		return commit(new Set<K>());
	}, [commit, disallowEmptySelection, selectionMode]);

	const selectAll = useCallback(() => {
		if (selectionMode !== "multiple") return false;
		return commit(new Set(availableKeys));
	}, [availableKeys, commit, selectionMode]);

	useEffect(() => {
		if (isControlled) return;
		setInternalSelection((current) => {
			const normalized = normalize(current);
			return setsEqual(current, normalized) ? current : normalized;
		});
	}, [isControlled, normalize]);

	return {
		selectedKeys: currentSelection as ReadonlySet<K>,
		isSelected: (key: K) => currentSelection.has(key),
		isDisabled: (key: K) => disabledKeySet.has(key),
		select,
		replace,
		clear,
		selectAll,
	};
}
