"use client";

/** Releases an object URL created by the caller. Safe during SSR and for empty values. */
export function revokeObjectUrl(url: string | null | undefined): void {
	if (!url || typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return;
	URL.revokeObjectURL(url);
}
