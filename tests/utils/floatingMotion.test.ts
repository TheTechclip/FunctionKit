import { describe, expect, test } from "vitest";
import {
	getFloatingHiddenTransform,
	getFloatingMotionPreset,
	getFloatingTransformOrigin,
} from "@/packages/utils/floatingMotion";

describe("getFloatingMotionPreset", () => {
	test("returns anchored preset", () => {
		const preset = getFloatingMotionPreset("anchored");
		expect(preset.enterMs).toBe(230);
		expect(preset.exitMs).toBe(170);
	});

	test("returns modal-center preset", () => {
		const preset = getFloatingMotionPreset("modal-center");
		expect(preset.enterMs).toBe(340);
		expect(preset.exitMs).toBe(260);
	});

	test("returns center-selected preset", () => {
		const preset = getFloatingMotionPreset("center-selected");
		expect(preset.enterMs).toBe(190);
		expect(preset.exitMs).toBe(140);
	});

	test("returns mobile-sheet preset", () => {
		const preset = getFloatingMotionPreset("mobile-sheet");
		expect(preset.enterMs).toBe(360);
		expect(preset.exitMs).toBe(280);
	});
});

describe("getFloatingTransformOrigin", () => {
	test("returns default when no placement", () => {
		expect(getFloatingTransformOrigin()).toBe("top center");
	});

	test("returns correct origin for top-left", () => {
		expect(getFloatingTransformOrigin("top-left")).toBe("bottom left");
	});

	test("returns correct origin for bottom-right", () => {
		expect(getFloatingTransformOrigin("bottom-right")).toBe("top right");
	});

	test("returns correct origin for middle-center", () => {
		expect(getFloatingTransformOrigin("middle-center")).toBe("center center");
	});

	test("returns correct origin for top-center", () => {
		expect(getFloatingTransformOrigin("top-center")).toBe("bottom center");
	});

	test("returns correct origin for top-right", () => {
		expect(getFloatingTransformOrigin("top-right")).toBe("bottom right");
	});

	test("returns correct origin for middle-left", () => {
		expect(getFloatingTransformOrigin("middle-left")).toBe("center left");
	});

	test("returns correct origin for middle-right", () => {
		expect(getFloatingTransformOrigin("middle-right")).toBe("center right");
	});

	test("returns correct origin for bottom-left", () => {
		expect(getFloatingTransformOrigin("bottom-left")).toBe("top left");
	});

	test("returns correct origin for bottom-center", () => {
		expect(getFloatingTransformOrigin("bottom-center")).toBe("top center");
	});
});

describe("getFloatingHiddenTransform", () => {
	test("returns mobile-sheet transform", () => {
		expect(getFloatingHiddenTransform({ mode: "mobile-sheet" })).toBe(
			"translateY(1.8rem) scale(1)",
		);
	});

	test("returns modal-center transform", () => {
		expect(getFloatingHiddenTransform({ mode: "modal-center" })).toBe(
			"translateY(.8rem) scale(.94)",
		);
	});

	test("returns center-selected transform", () => {
		expect(getFloatingHiddenTransform({ mode: "center-selected" })).toBe(
			"translateY(.45rem) scale(.99)",
		);
	});

	test("anchored with no placement", () => {
		expect(getFloatingHiddenTransform({ mode: "anchored" })).toBe("translateY(.4rem) scale(.975)");
	});

	test("anchored with top placement", () => {
		expect(getFloatingHiddenTransform({ mode: "anchored", placement: "top-left" })).toBe(
			"translateY(.4rem) scale(.975)",
		);
	});

	test("anchored with bottom placement", () => {
		expect(getFloatingHiddenTransform({ mode: "anchored", placement: "bottom-center" })).toBe(
			"translateY(-.4rem) scale(.975)",
		);
	});

	test("anchored with middle-left placement", () => {
		expect(getFloatingHiddenTransform({ mode: "anchored", placement: "middle-left" })).toBe(
			"translateX(.4rem) scale(.975)",
		);
	});

	test("anchored with middle-right placement", () => {
		expect(getFloatingHiddenTransform({ mode: "anchored", placement: "middle-right" })).toBe(
			"translateX(-.4rem) scale(.975)",
		);
	});

	test("anchored with middle-center placement falls through to default", () => {
		expect(getFloatingHiddenTransform({ mode: "anchored", placement: "middle-center" })).toBe(
			"translateY(.4rem) scale(.975)",
		);
	});

	test("anchored with middle placement and undefined col falls through", () => {
		// @ts-expect-error - testing unexpected placement fallthrough
		expect(getFloatingHiddenTransform({ mode: "anchored", placement: "middle" })).toBe(
			"translateY(.4rem) scale(.975)",
		);
	});
});
