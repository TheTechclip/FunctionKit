export type FloatingMotionMode =
	| "anchored"
	| "center-selected"
	| "modal-center"
	| "mobile-sheet";

export type FloatingPlacement =
	| "top-left"
	| "top-center"
	| "top-right"
	| "middle-left"
	| "middle-center"
	| "middle-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right";

export interface FloatingMotionPreset {
	enterMs: number;
	exitMs: number;
	ease: string;
}

export const getFloatingMotionPreset = (
	mode: FloatingMotionMode,
): FloatingMotionPreset => {
	if (mode === "mobile-sheet") {
		return {
			enterMs: 360,
			exitMs: 280,
			ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
		};
	}

	if (mode === "modal-center") {
		return {
			enterMs: 340,
			exitMs: 260,
			ease: "cubic-bezier(0.22, 1, 0.36, 1)",
		};
	}

	if (mode === "center-selected") {
		return {
			enterMs: 190,
			exitMs: 140,
			ease: "cubic-bezier(0.2, 0, 0, 1)",
		};
	}

	return {
		enterMs: 230,
		exitMs: 170,
		ease: "cubic-bezier(0.16, 1, 0.3, 1)",
	};
};

export const getFloatingTransformOrigin = (
	placement?: FloatingPlacement,
): string => {
	if (!placement) return "top center";

	const [row, col] = placement.split("-") as [
		"top" | "middle" | "bottom",
		"left" | "center" | "right",
	];
	const y = row === "top" ? "bottom" : row === "bottom" ? "top" : "center";
	const x = col === "right" ? "right" : col === "left" ? "left" : "center";

	return `${y} ${x}`;
};

export const getFloatingHiddenTransform = ({
	mode,
	placement,
}: {
	mode: FloatingMotionMode;
	placement?: FloatingPlacement;
}): string => {
	if (mode === "mobile-sheet") return "translateY(1.8rem) scale(1)";
	if (mode === "modal-center") return "translateY(.8rem) scale(.94)";
	if (mode === "center-selected") return "translateY(.45rem) scale(.99)";
	if (!placement) return "translateY(.4rem) scale(.975)";

	const [row, col] = placement.split("-") as [
		"top" | "middle" | "bottom",
		"left" | "center" | "right",
	];

	if (row === "top") return "translateY(.4rem) scale(.975)";
	if (row === "bottom") return "translateY(-.4rem) scale(.975)";

	if (row === "middle") {
		if (col === "left") return "translateX(.4rem) scale(.975)";
		if (col === "right") return "translateX(-.4rem) scale(.975)";
	}

	return "translateY(.4rem) scale(.975)";
};
