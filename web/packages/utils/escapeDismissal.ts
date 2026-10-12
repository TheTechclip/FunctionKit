let blockerCount = 0;

export function acquireEscapeDismissalBlock() {
	blockerCount += 1;
	let released = false;

	return () => {
		if (released) return;
		released = true;
		blockerCount = Math.max(0, blockerCount - 1);
	};
}

export function isEscapeDismissalBlocked() {
	return blockerCount > 0;
}
