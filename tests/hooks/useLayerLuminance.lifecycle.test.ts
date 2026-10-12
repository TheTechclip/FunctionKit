import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useLayerLuminance } from "@/web/packages/hooks/useLayerLuminance";

const rect = (width = 200, height = 200, left = 0, top = 0) =>
	({
		bottom: top + height,
		height,
		left,
		right: left + width,
		top,
		width,
		x: left,
		y: top,
		toJSON: () => ({}),
	}) as DOMRect;

function installRaf() {
	const frames = new Map<number, FrameRequestCallback>();
	let id = 0;
	const request = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
		frames.set(++id, callback);
		return id;
	});
	const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frame) => {
		frames.delete(frame);
	});
	return {
		frames,
		request,
		cancel,
		flush() {
			act(() => {
				const pending = [...frames.values()];
				frames.clear();
				for (const callback of pending) callback(0);
			});
		},
	};
}

function installElementsFromPoint(resolve: () => Element[]) {
	Object.defineProperty(document, "elementsFromPoint", {
		configurable: true,
		value: vi.fn(resolve),
	});
}

function setRect(element: Element, value: DOMRect) {
	vi.spyOn(element, "getBoundingClientRect").mockReturnValue(value);
}

function renderLuminance(root: HTMLElement, target: HTMLElement | null) {
	const rootRef = { current: root };
	const targetRef = { current: target };
	return renderHook(() => useLayerLuminance(rootRef, [targetRef]));
}

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	document.body.replaceChildren();
});

describe("useLayerLuminance rendered-surface sampling", () => {
	test.each([false, true])(
		"composes an opaque gradient above the source only when requested (%s)",
		(includePaintLayers) => {
			const raf = installRaf();
			const root = document.createElement("div");
			const image = document.createElement("img");
			const paint = document.createElement("div");
			paint.dataset.layerLuminancePaint = "";
			const target = document.createElement("button");
			root.append(image, paint, target);
			document.body.append(root);
			setRect(image, rect());
			setRect(paint, rect());
			setRect(target, rect(20, 20, 90, 90));
			Object.defineProperties(image, {
				complete: { value: true },
				naturalWidth: { value: 200 },
				naturalHeight: { value: 200 },
			});
			const context = {
				clearRect: vi.fn(),
				drawImage: vi.fn(),
				getImageData: vi.fn(() => ({ data: new Uint8ClampedArray([255, 255, 255, 255]) })),
			} as unknown as CanvasRenderingContext2D;
			vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
			vi.spyOn(window, "getComputedStyle").mockImplementation(
				(element) =>
					({
						objectFit: "cover",
						backgroundColor: "transparent",
						maskImage: "none",
						opacity: "1",
						backgroundImage:
							element === paint
								? "linear-gradient(45deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 75%, color(srgb 0 0 0 / 0) 100%)"
								: "none",
					}) as CSSStyleDeclaration,
			);
			const rootRef = { current: root };
			const targets = [{ current: target }];
			const { result } = renderHook(() =>
				useLayerLuminance(rootRef, targets, { includePaintLayers }),
			);
			raf.flush();
			expect(result.current).toEqual([includePaintLayers ? 0 : 1]);
			expect(context.getImageData).toHaveBeenCalledTimes(9);
		},
	);

	test("alpha-composes paint, resamples after scrolling, and preserves null for unknown translucent backdrops", () => {
		vi.useFakeTimers();
		const raf = installRaf();
		const root = document.createElement("div");
		const image = document.createElement("img");
		const paint = document.createElement("div");
		paint.dataset.layerLuminancePaint = "";
		const target = document.createElement("button");
		root.append(image, paint, target);
		document.body.append(root);
		setRect(image, rect());
		const paintRect = vi.spyOn(paint, "getBoundingClientRect").mockReturnValue(rect());
		setRect(target, rect(20, 20, 90, 90));
		Object.defineProperties(image, {
			complete: { value: true },
			naturalWidth: { value: 200 },
			naturalHeight: { value: 200 },
		});
		let readable = true;
		const context = {
			clearRect: vi.fn(),
			drawImage: vi.fn(),
			getImageData: vi.fn(() => {
				if (!readable) throw new DOMException("tainted");
				return { data: new Uint8ClampedArray([0, 0, 0, 255]) };
			}),
		} as unknown as CanvasRenderingContext2D;
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
		installElementsFromPoint(() => []);
		vi.spyOn(window, "getComputedStyle").mockImplementation(
			(element) =>
				({
					objectFit: "cover",
					backgroundColor: "transparent",
					maskImage: "none",
					opacity: "1",
					backgroundImage:
						element === paint
							? "linear-gradient(90deg, rgb(255, 255, 255) 0%, color(srgb 1 1 1 / 0) 100%)"
							: "none",
				}) as CSSStyleDeclaration,
		);
		const rootRef = { current: root };
		const targets = [{ current: target }];
		const { result } = renderHook(() =>
			useLayerLuminance(rootRef, targets, { includePaintLayers: true }),
		);
		raf.flush();
		expect(result.current[0]).toBeCloseTo(0.5);
		paintRect.mockReturnValue(rect(200, 200, -50, 0));
		root.dispatchEvent(new Event("scroll"));
		act(() => vi.advanceTimersByTime(120));
		raf.flush();
		expect(result.current[0]).toBeCloseTo(0.25);
		readable = false;
		root.dispatchEvent(new Event("scroll"));
		act(() => vi.advanceTimersByTime(120));
		raf.flush();
		expect(result.current).toEqual([null]);
	});
	test("samples an opaque background while excluding non-HTML, outside-root, and control elements", () => {
		const raf = installRaf();
		const root = document.createElement("div");
		const background = document.createElement("div");
		background.dataset.themeBackgroundLayer = "";
		const controls = document.createElement("div");
		controls.dataset.hScrollControls = "";
		const controlChild = document.createElement("span");
		controls.append(controlChild);
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		const target = document.createElement("button");
		const outside = document.createElement("div");
		root.append(background, controls, svg, target);
		document.body.append(root, outside);
		setRect(background, rect());
		setRect(target, rect(20, 20, 90, 90));
		installElementsFromPoint(() => [svg, controlChild, outside, background]);
		vi.spyOn(window, "getComputedStyle").mockImplementation(
			(element) =>
				({
					backgroundColor: element === background ? "rgb(0, 0, 0)" : "transparent",
				}) as CSSStyleDeclaration,
		);
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

		const { result } = renderLuminance(root, target);
		raf.flush();
		expect(result.current).toEqual([0]);
		expect(document.elementsFromPoint).toHaveBeenCalledTimes(9);
	});

	test("skips unparsable and fully transparent surfaces before using an opaque-enough fallback", () => {
		const raf = installRaf();
		const root = document.createElement("div");
		const invalid = document.createElement("div");
		const transparent = document.createElement("div");
		const visible = document.createElement("div");
		for (const layer of [invalid, transparent, visible]) {
			layer.dataset.themeBackgroundLayer = "";
			setRect(layer, rect());
			root.append(layer);
		}
		const target = document.createElement("button");
		root.append(target);
		setRect(target, rect(20, 20, 90, 90));
		document.body.append(root);
		installElementsFromPoint(() => [invalid, transparent, visible]);
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
		vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
			const backgroundColor =
				element === invalid
					? "transparent"
					: element === transparent
						? "rgba(0, 0, 0, 0)"
						: "rgba(255, 255, 255, 0.5)";
			return { backgroundColor } as CSSStyleDeclaration;
		});

		const { result } = renderLuminance(root, target);
		raf.flush();
		expect(result.current).toEqual([1]);
	});

	test("samples a nested contained image using its rendered object-fit geometry", () => {
		const raf = installRaf();
		const root = document.createElement("div");
		const layer = document.createElement("div");
		layer.dataset.themeBackgroundLayer = "";
		const image = document.createElement("img");
		const target = document.createElement("button");
		layer.append(image);
		root.append(layer, target);
		document.body.append(root);
		setRect(layer, rect());
		setRect(image, rect());
		setRect(target, rect(20, 20, 90, 90));
		Object.defineProperties(image, {
			complete: { configurable: true, value: true },
			naturalHeight: { configurable: true, value: 50 },
			naturalWidth: { configurable: true, value: 100 },
		});
		const context = {
			clearRect: vi.fn(),
			drawImage: vi.fn(),
			getImageData: vi.fn(() => ({ data: new Uint8ClampedArray([0, 0, 0, 255]) })),
		} as unknown as CanvasRenderingContext2D;
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => context);
		vi.spyOn(window, "getComputedStyle").mockImplementation(
			(element) =>
				({
					objectFit: element === image ? "contain" : "cover",
					backgroundColor: "transparent",
				}) as CSSStyleDeclaration,
		);
		installElementsFromPoint(() => []);

		const { result } = renderLuminance(root, target);
		raf.flush();
		expect(result.current).toEqual([0]);
		expect(context.drawImage).toHaveBeenCalled();
	});

	test.each(["incomplete", "zero-rect", "no-context", "tainted"] as const)(
		"falls back safely when image sampling is %s",
		(mode) => {
			const raf = installRaf();
			const root = document.createElement("div");
			const layer = document.createElement("div");
			layer.dataset.themeBackgroundLayer = "";
			const image = document.createElement("img");
			const target = document.createElement("button");
			layer.append(image);
			root.append(layer, target);
			document.body.append(root);
			setRect(layer, rect());
			setRect(image, mode === "zero-rect" ? rect(0, 0) : rect());
			setRect(target, rect(20, 20, 90, 90));
			Object.defineProperties(image, {
				complete: { configurable: true, value: mode !== "incomplete" },
				naturalHeight: { configurable: true, value: 100 },
				naturalWidth: { configurable: true, value: 100 },
			});
			const context = {
				clearRect: vi.fn(),
				drawImage: vi.fn(),
				getImageData: vi.fn(() => {
					if (mode === "tainted") throw new DOMException("tainted");
					return { data: new Uint8ClampedArray([255, 255, 255, 255]) };
				}),
			} as unknown as CanvasRenderingContext2D;
			vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() =>
				mode === "no-context" ? null : context,
			);
			installElementsFromPoint(() => []);

			const { result } = renderLuminance(root, target);
			raf.flush();
			expect(result.current).toEqual([null]);
		},
	);

	test("returns null when neither a target surface nor an image can be sampled", () => {
		const raf = installRaf();
		const root = document.createElement("div");
		const target = document.createElement("button");
		root.append(target);
		document.body.append(root);
		setRect(target, rect(20, 20, 90, 90));
		installElementsFromPoint(() => []);
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
		const { result } = renderLuminance(root, target);
		raf.flush();
		expect(result.current).toEqual([null]);
	});

	test("returns null for a temporarily missing target", () => {
		const raf = installRaf();
		const root = document.createElement("div");
		document.body.append(root);
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
		const { result } = renderLuminance(root, null);
		raf.flush();
		expect(result.current).toEqual([null]);
	});
});

describe("useLayerLuminance scheduling and cleanup", () => {
	test("coalesces RAF work, debounces settle events, and releases every owned browser resource", () => {
		vi.useFakeTimers();
		const raf = installRaf();
		let resizeCallback: ResizeObserverCallback = () => {};
		let mutationCallback: MutationCallback = () => {};
		const resizeDisconnect = vi.fn();
		const mutationDisconnect = vi.fn();
		class ResizeObserverMock {
			constructor(callback: ResizeObserverCallback) {
				resizeCallback = callback;
			}
			observe = vi.fn();
			disconnect = resizeDisconnect;
		}
		class MutationObserverMock {
			constructor(callback: MutationCallback) {
				mutationCallback = callback;
			}
			observe = vi.fn();
			disconnect = mutationDisconnect;
		}
		vi.stubGlobal("ResizeObserver", ResizeObserverMock);
		vi.stubGlobal("MutationObserver", MutationObserverMock);

		const root = document.createElement("div");
		const image = document.createElement("img");
		const target = document.createElement("button");
		root.append(image, target);
		document.body.append(root);
		setRect(image, rect());
		setRect(target, rect(20, 20, 90, 90));
		Object.defineProperties(image, {
			complete: { configurable: true, value: false },
			naturalHeight: { configurable: true, value: 100 },
			naturalWidth: { configurable: true, value: 100 },
		});
		installElementsFromPoint(() => []);
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
		const remove = vi.spyOn(root, "removeEventListener");
		const imageRemove = vi.spyOn(image, "removeEventListener");

		const { unmount } = renderLuminance(root, target);
		expect(raf.request).toHaveBeenCalledTimes(1);

		act(() => resizeCallback([], {} as ResizeObserver));
		image.dispatchEvent(new Event("load"));
		expect(raf.request).toHaveBeenCalledTimes(1);

		root.dispatchEvent(new Event("scroll", { bubbles: true }));
		root.dispatchEvent(new Event("scroll", { bubbles: true }));
		act(() => mutationCallback([], {} as MutationObserver));
		expect(vi.getTimerCount()).toBe(1);

		unmount();
		expect(raf.cancel).toHaveBeenCalledOnce();
		expect(resizeDisconnect).toHaveBeenCalledOnce();
		expect(mutationDisconnect).toHaveBeenCalledOnce();
		expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function), true);
		expect(imageRemove).toHaveBeenCalledWith("load", expect.any(Function));
		expect(vi.getTimerCount()).toBe(0);
	});
});
