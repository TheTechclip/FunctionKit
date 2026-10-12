"use client";

import type {
	NavigatorClipboardProps,
	NavigatorClipboardResult,
	NavigatorShareProps,
	NavigatorShareResult,
} from "./clipboardShare.types";

export async function NavigatorClipboard({
	text,
}: NavigatorClipboardProps): Promise<NavigatorClipboardResult> {
	try {
		if (typeof navigator === "undefined" || !navigator.clipboard) return { success: false };
		await navigator.clipboard.writeText(text);
		return { success: true };
	} catch {
		return { success: false };
	}
}

export async function NavigatorShare({
	title,
	text,
	link,
}: NavigatorShareProps): Promise<NavigatorShareResult> {
	try {
		if (typeof navigator !== "undefined" && navigator.share) {
			await navigator.share({ title, text, url: link });
			return { success: true, method: "share" };
		}
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			return { success: false, method: "share" };
		}
	}

	return clipboardFallback(link);
}

async function clipboardFallback(link: string): Promise<NavigatorShareResult> {
	const { success } = await NavigatorClipboard({ text: link });
	return { success, method: success ? "clipboard" : "unsupported" };
}
