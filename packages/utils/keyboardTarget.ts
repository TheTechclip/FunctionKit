"use client";

export function isEditableKeyboardTarget(target: HTMLElement) {
	return (
		target.isContentEditable ||
		target.tagName === "TEXTAREA" ||
		target.tagName === "SELECT" ||
		(target.tagName === "INPUT" &&
			(target as HTMLInputElement).type !== "button" &&
			(target as HTMLInputElement).type !== "checkbox" &&
			(target as HTMLInputElement).type !== "radio")
	);
}
