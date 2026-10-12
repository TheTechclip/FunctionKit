"use client";

export function isEditableKeyboardTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) {
		return false;
	}

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
