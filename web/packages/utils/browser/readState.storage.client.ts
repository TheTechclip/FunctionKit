"use client";

import { type HasReadStateOptions, hasReadState, markReadState } from "../readState";

export type ReadStateStorage = Pick<Storage, "getItem" | "setItem">;

export function getStorageReadState(storage: ReadStateStorage, key: string): string | null {
	return storage.getItem(key);
}

export function hasStorageReadState(
	storage: ReadStateStorage,
	key: string,
	itemId: string,
	options?: HasReadStateOptions,
) {
	return hasReadState(getStorageReadState(storage, key), itemId, options);
}

export function markStorageReadState(
	storage: ReadStateStorage,
	key: string,
	itemIds: Iterable<string>,
): string {
	const nextValue = markReadState(getStorageReadState(storage, key), itemIds);
	storage.setItem(key, nextValue);
	return nextValue;
}
