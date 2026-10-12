import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import {
	getColorLuminance,
	resolveLuminanceThreshold,
	useLayerLuminance,
} from "@/web/packages/hooks/useLayerLuminance";

describe("getColorLuminance", () => {
	test("normalizes black and white", () => {
		expect(getColorLuminance(0, 0, 0)).toBe(0);
		expect(getColorLuminance(255, 255, 255)).toBe(1);
	});

	test("weights green above blue", () => {
		expect(getColorLuminance(0, 255, 0)).toBeGreaterThan(getColorLuminance(0, 0, 255));
	});
});

describe("resolveLuminanceThreshold", () => {
	test("holds its previous state within the hysteresis band", () => {
		expect(resolveLuminanceThreshold(true, 0.45, { darkenAt: 0.35, lightenAt: 0.55 })).toBe(true);
		expect(resolveLuminanceThreshold(false, 0.45, { darkenAt: 0.35, lightenAt: 0.55 })).toBe(false);
	});

	test("retains the previous state when the layer cannot be sampled", () => {
		expect(resolveLuminanceThreshold(true, null, { darkenAt: 0.35, lightenAt: 0.55 })).toBe(true);
	});
});

describe("useLayerLuminance", () => {
	test("uses the configured dark state before a target can be sampled", () => {
		const rootRef = { current: null };
		const targetRef = { current: null };
		const { result } = renderHook(() => useLayerLuminance(rootRef, [targetRef]));

		expect(result.current).toEqual([null]);
	});

	test.each([false, true])(
		"samples image media once per cycle (strict mode: %s)",
		(reactStrictMode) => {
			const root = document.createElement("div");
			const image = document.createElement("img");
			const target = document.createElement("div");
			const rect = {
				bottom: 240,
				height: 240,
				left: 0,
				right: 320,
				top: 0,
				width: 320,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			} as DOMRect;
			root.append(image, target);
			Object.defineProperties(image, {
				complete: { configurable: true, value: true },
				naturalHeight: { configurable: true, value: 6000 },
				naturalWidth: { configurable: true, value: 4000 },
			});
			vi.spyOn(image, "getBoundingClientRect").mockReturnValue(rect);
			vi.spyOn(target, "getBoundingClientRect").mockReturnValue(rect);
			const context = {
				clearRect: vi.fn(),
				drawImage: vi.fn(),
				getImageData: vi.fn(() => ({
					data: new Uint8ClampedArray([255, 255, 255, 255]),
				})),
			} as unknown as CanvasRenderingContext2D;
			vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => context);
			const frames = new Map<number, FrameRequestCallback>();
			let frameId = 0;
			vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
				frames.set(++frameId, callback);
				return frameId;
			});
			vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
				frames.delete(id);
			});

			const rootRef = { current: root };
			const targets = [{ current: target }];
			const { result } = renderHook(() => useLayerLuminance(rootRef, targets), {
				reactStrictMode,
			});
			act(() => {
				const pending = [...frames.values()];
				frames.clear();
				for (const frame of pending) frame(0);
			});

			expect(result.current).toEqual([1]);
			expect(context.getImageData).toHaveBeenCalledTimes(9);
		},
	);
});
