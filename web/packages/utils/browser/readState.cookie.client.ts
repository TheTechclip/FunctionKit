"use client";

import { type HasReadStateOptions, hasReadState, markReadState } from "../readState";
import { getClientCookie, setClientCookie } from "./cookie.client";

export interface CookieReadStateOptions {
	key: string;
	days?: number;
}

export function getCookieReadState({ key }: CookieReadStateOptions): string | null {
	return getClientCookie(key) ?? null;
}

export function hasCookieReadState(
	itemId: string,
	options: CookieReadStateOptions & HasReadStateOptions,
) {
	return hasReadState(getCookieReadState(options), itemId, options);
}

export function markCookieReadState(
	itemIds: Iterable<string>,
	options: CookieReadStateOptions,
): string {
	const nextValue = markReadState(getCookieReadState(options), itemIds);
	setClientCookie(options.key, nextValue, options.days);
	return nextValue;
}
