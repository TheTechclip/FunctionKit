import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useLayerLuminance } from "@/web/packages/hooks/useLayerLuminance";

const rectangle = (width = 200, height = 200, left = 0, top = 0) =>
	({
		width,
		height,
		left,
		top,
		right: left + width,
		bottom: top + height,
		x: left,
		y: top,
		toJSON: () => ({}),
	}) as DOMRect;

afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

function sample({
	gradient = "linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)",
	maskImage = "none",
	opacity = "1",
	paintRect = rectangle(),
	targetRect = rectangle(20, 20, 90, 90),
	insideControls = false,
	knownBackdrop = true,
} = {}) {
	const root = document.createElement("div");
	const surface = document.createElement("div");
	const paint = document.createElement("div");
	paint.dataset.layerLuminancePaint = "";
	const target = document.createElement("button");
	root.append(surface, target);
	if (insideControls) {
		const controls = document.createElement("div");
		controls.dataset.hScrollControls = "";
		controls.append(paint);
		root.append(controls);
	} else root.append(paint);
	document.body.append(root);
	vi.spyOn(paint, "getBoundingClientRect").mockReturnValue(paintRect);
	vi.spyOn(target, "getBoundingClientRect").mockReturnValue(targetRect);
	Object.defineProperty(document, "elementsFromPoint", {
		configurable: true,
		value: () => (knownBackdrop ? [surface] : []),
	});
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
	vi.spyOn(window, "getComputedStyle").mockImplementation(
		(element) =>
			({
				backgroundColor: element === surface ? "rgb(255, 255, 255)" : "transparent",
				backgroundImage: element === paint ? gradient : "none",
				maskImage,
				opacity,
			}) as CSSStyleDeclaration,
	);
	let frame: FrameRequestCallback | undefined;
	vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
		frame = callback;
		return 1;
	});
	vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
	const rootRef = { current: root };
	const targets = [{ current: target }];
	const result = renderHook(() =>
		useLayerLuminance(rootRef, targets, { includePaintLayers: true }),
	);
	act(() => frame?.(0));
	return result.result.current[0];
}

test.each([
	"none",
	"radial-gradient(rgb(0, 0, 0), rgb(255, 255, 255))",
	"linear-gradient(to nowhere, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)",
	"linear-gradient(90deg, rgb(0, 0, 0) 50%)",
	"linear-gradient(90deg, rgb(0, 0, 0), rgb(0, 0, 0) 100%)",
	"linear-gradient(90deg, red 0%, rgb(0, 0, 0) 100%)",
	"linear-gradient(90deg, rgb(0, 0) 0%, rgb(0, 0, 0) 100%)",
	"linear-gradient(90deg, rgb(invalid, 0, 0) 0%, rgb(0, 0, 0) 100%)",
])("keeps the measured backdrop when paint is unsupported: %s", (gradient) => {
	expect(sample({ gradient })).toBe(1);
});

test("excludes masked paint and paints inside controls", () => {
	expect(sample({ maskImage: "url(mask.svg)" })).toBe(1);
	expect(sample({ insideControls: true })).toBe(1);
});

test.each(["to top", "to right", "to bottom", "to left"])(
	"accepts cardinal gradient direction %s",
	(direction) => {
		expect(
			sample({
				gradient: `linear-gradient(${direction}, color(srgb 0 0 0) 0%, color(srgb 0 0 0) 100%)`,
				opacity: "",
				maskImage: "",
			}),
		).toBe(0);
	},
);

test("respects paint opacity and leaves fully transparent paint out of the sample", () => {
	expect(sample({ opacity: "0.5" })).toBe(0.5);
	expect(sample({ gradient: "linear-gradient(90deg, transparent 0%, transparent 100%)" })).toBe(1);
});

test.each([
	rectangle(200, 200, 150, 0),
	rectangle(50, 200),
	rectangle(200, 200, 0, 150),
	rectangle(200, 50),
])("ignores paint outside the target samples (%j)", (paintRect) => {
	expect(sample({ paintRect })).toBe(1);
});

test("ignores paint with zero area", () => {
	expect(sample({ paintRect: rectangle(0, 0), targetRect: rectangle(20, 20, -10, -10) })).toBe(1);
});

test.each([
	["0%", "30%"],
	["70%", "100%"],
])("uses endpoint paint when the sample is outside its stop range (%s, %s)", (first, last) => {
	expect(
		sample({ gradient: `linear-gradient(90deg, rgb(0, 0, 0) ${first}, rgb(0, 0, 0) ${last})` }),
	).toBe(0);
});

test("measures an opaque overlay without a readable backdrop", () => {
	expect(sample({ knownBackdrop: false })).toBe(0);
});
