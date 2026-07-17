"use client";

const EXPIRED_COOKIE_DATE = "Thu, 01 Jan 1970 00:00:00 GMT";

type CookieStoreLike = {
	delete: (name: string) => Promise<void>;
};

type DocumentCookieRef = {
	cookie: string;
};

type ClearClientCookieOptions = {
	hostname?: string;
	path?: string;
	documentRef?: DocumentCookieRef;
	cookieStore?: CookieStoreLike;
};

type ClearAllClientCookiesOptions = ClearClientCookieOptions & {
	includeRoot?: boolean;
	cookieString?: string;
};

function findClientCookie(name: string, documentRef: DocumentCookieRef): string | undefined {
	const parsed = parseClientCookie(documentRef.cookie);
	return parsed[name];
}

function parseClientCookie(cookieString: string): Record<string, string> {
	return cookieString
		.split(";")
		.map((pair) => pair.trim().split("=") as [string, string])
		.reduce<Record<string, string>>((acc, [key, value]) => {
			if (key) {
				acc[key] = value;
			}
			return acc;
		}, {});
}

import { parseClientCookieNames } from "./cookieNames.shared";

export { parseClientCookieNames };

export function getClientCookie(name: string): string | undefined {
	if (typeof document === "undefined") {
		return undefined;
	}

	return findClientCookie(name, document);
}

export function setClientCookie(
	name: string,
	value: string,
	days?: number,
	documentRef?: DocumentCookieRef,
) {
	if (typeof document === "undefined") {
		return;
	}

	const ref = documentRef ?? document;

	let expires = "";
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = `; expires=${date.toUTCString()}`;
	}

	ref.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}

export function clearClientCookie(name: string, options: ClearClientCookieOptions = {}): void {
	const { hostname = window.location.hostname, path = "/", documentRef = document } = options;

	documentRef.cookie = `${name}=; expires=${EXPIRED_COOKIE_DATE}; path=${path}; domain=${hostname};`;
}

export function clearAllClientCookies(options: ClearAllClientCookiesOptions = {}): string[] {
	const { documentRef = document, cookieStore, includeRoot = false, cookieString } = options;

	const entries = cookieString
		? parseClientCookieNames(cookieString)
		: documentRef.cookie
				.split(/;\s*/)
				.map((entry) => {
					const eqPos = entry.indexOf("=");
					return eqPos > -1 ? entry.slice(0, eqPos).trim() : entry.trim();
				})
				.filter(Boolean);

	if (cookieStore) {
		for (const name of entries) {
			cookieStore.delete(name);
		}
		return entries;
	}

	const hostnameParts = window.location.hostname.split(".");
	const { pathname } = window.location;

	const paths = [pathname];
	if (includeRoot) {
		paths.unshift("/");
	}

	for (const name of entries) {
		for (const path of paths) {
			for (let i = 0; i < hostnameParts.length; i++) {
				const domain = hostnameParts.slice(i).join(".");
				documentRef.cookie = `${name}=; expires=${EXPIRED_COOKIE_DATE}; path=${path}; domain=${domain};`;
			}
		}
	}

	return entries;
}
