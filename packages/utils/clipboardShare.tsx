"use client";

import type {
	NavigatorClipboardProps,
	NavigatorClipboardResult,
	NavigatorShareProps,
	NavigatorShareResult,
} from "./clipboardShare.types";

export function NavigatorClipboard({
	text,
}: NavigatorClipboardProps): Promise<NavigatorClipboardResult> {
	return navigator.clipboard.writeText(text).then(
		() => ({ success: true }),
		() => ({ success: false }),
	);
}

export function NavigatorShare({
	title,
	text,
	link,
}: NavigatorShareProps): Promise<NavigatorShareResult> {
	if (navigator.share) {
		return navigator.share({ title, text, url: link }).then(
			() => ({ success: true, method: "share" }),
			(error) => {
				if (error instanceof DOMException && error.name === "AbortError") {
					return { success: false, method: "share" };
				}
				return clipboardFallback(link);
			},
		);
	}

	return clipboardFallback(link);
}

function clipboardFallback(link: string): Promise<NavigatorShareResult> {
	if (navigator.clipboard) {
		return navigator.clipboard.writeText(link).then(
			() => ({ success: true, method: "clipboard" }),
			() => ({ success: false, method: "unsupported" }),
		);
	}
	return Promise.resolve({ success: false, method: "unsupported" });
}
