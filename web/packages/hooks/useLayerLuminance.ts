"use client";

import type { RefObject } from "react";
import { useLayoutEffect, useState } from "react";
import { subscribeWindowResize } from "../utils/browser/sharedBrowserEvents";

const SETTLE_DELAY_MS = 120;

export function getColorLuminance(red: number, green: number, blue: number) {
	return (red * 299 + green * 587 + blue * 114) / 255000;
}

export interface LuminanceThresholds {
	darkenAt: number;
	lightenAt: number;
}

export function resolveLuminanceThreshold(
	previousMatch: boolean,
	luminance: number | null,
	thresholds: LuminanceThresholds,
) {
	if (luminance === null) return previousMatch;
	return previousMatch ? luminance < thresholds.lightenAt : luminance <= thresholds.darkenAt;
}

type RenderedLayer = { element: HTMLElement; rect: DOMRect };

type PaintColor = { luminance: number; alpha: number };
type PaintLayer = {
	rect: DOMRect;
	angle: number;
	stops: { position: number; color: PaintColor }[];
};

function splitGradient(value: string) {
	let depth = 0;
	let start = 0;
	const parts: string[] = [];
	for (let index = 0; index < value.length; index++) {
		if (value[index] === "(") depth++;
		if (value[index] === ")") depth--;
		if (value[index] === "," && depth === 0) {
			parts.push(value.slice(start, index).trim());
			start = index + 1;
		}
	}
	parts.push(value.slice(start).trim());
	return parts;
}

function parsePaintColor(value: string): PaintColor | null {
	if (value === "transparent") return { luminance: 0, alpha: 0 };
	const rgb = value.match(/^rgba?\((.+)\)$/);
	const srgb = value.match(/^color\(srgb\s+(.+)\)$/);
	const matchedColor = rgb ?? srgb;
	if (!matchedColor) return null;
	const channels = matchedColor[1].split(/[\s,/]+/).map(Number);
	if (channels.length < 3 || channels.some((channel) => !Number.isFinite(channel))) return null;
	const scale = srgb ? 255 : 1;
	return {
		luminance: getColorLuminance(channels[0] * scale, channels[1] * scale, channels[2] * scale),
		alpha: channels[3] ?? 1,
	};
}

function readPaintLayers(root: HTMLElement, controls: HTMLElement | null): PaintLayer[] {
	return Array.from(root.querySelectorAll<HTMLElement>("[data-layer-luminance-paint]")).flatMap(
		(element) => {
			if (controls?.contains(element)) return [];
			const style = window.getComputedStyle(element);
			// Opt-in paints must be unmasked, single linear gradients with percentage stops.
			if (style.maskImage && style.maskImage !== "none") return [];
			const gradient = style.backgroundImage.match(/^linear-gradient\((.*)\)$/);
			if (!gradient) return [];
			const [heading, ...parts] = splitGradient(gradient[1]);
			const sides: Record<string, number> = {
				"to top": 0,
				"to right": 90,
				"to bottom": 180,
				"to left": 270,
			};
			const angle = heading.endsWith("deg") ? Number.parseFloat(heading) : sides[heading];
			if (!Number.isFinite(angle)) return [];
			const stops = parts.map((part) => {
				const stop = part.match(/^(.*)\s+([\d.]+)%$/);
				const color = stop && parsePaintColor(stop[1]);
				return stop && color
					? {
							position: Number(stop[2]) / 100,
							color: { ...color, alpha: color.alpha * Number(style.opacity || 1) },
						}
					: null;
			});
			if (stops.length < 2 || stops.some((stop) => stop === null)) return [];
			return [
				{
					rect: element.getBoundingClientRect(),
					angle,
					stops: stops.filter((stop) => stop !== null),
				},
			];
		},
	);
}

function compositePaint(luminance: number | null, paint: PaintLayer, x: number, y: number) {
	const { rect, stops } = paint;
	if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return luminance;
	const radians = (paint.angle * Math.PI) / 180;
	const dx = Math.sin(radians);
	const dy = -Math.cos(radians);
	const length = Math.abs(rect.width * dx) + Math.abs(rect.height * dy);
	if (!length) return luminance;
	const progress =
		0.5 + ((x - rect.left - rect.width / 2) * dx + (y - rect.top - rect.height / 2) * dy) / length;
	const endIndex = stops.findIndex((stop) => stop.position >= progress);
	const end = stops[endIndex < 0 ? stops.length - 1 : endIndex];
	const start = stops[Math.max(0, endIndex < 0 ? stops.length - 1 : endIndex - 1)];
	const span = end.position - start.position;
	const mix = span ? Math.max(0, Math.min(1, (progress - start.position) / span)) : 0;
	const alpha = start.color.alpha * (1 - mix) + end.color.alpha * mix;
	const premultiplied =
		start.color.luminance * start.color.alpha * (1 - mix) +
		end.color.luminance * end.color.alpha * mix;
	if (alpha === 0) return luminance;
	if (luminance === null && alpha < 1) return null;
	return premultiplied + (luminance ?? 0) * (1 - alpha);
}

function findLayerAtPoint(layers: readonly RenderedLayer[], x: number, y: number) {
	return layers.find(
		({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom,
	)?.element;
}

function findImageAtPoint(layers: readonly RenderedLayer[], x: number, y: number) {
	const layer = findLayerAtPoint(layers, x, y);
	if (!layer) return undefined;
	return layer instanceof HTMLImageElement
		? layer
		: (layer.querySelector<HTMLImageElement>("img") ?? undefined);
}

type ImageMetrics = {
	width: number;
	height: number;
	offsetX: number;
	offsetY: number;
};

function getImagePointLuminance(
	context: CanvasRenderingContext2D | null,
	image: HTMLImageElement,
	x: number,
	y: number,
	metricsCache: Map<HTMLImageElement, ImageMetrics | null>,
) {
	if (!image.complete || !image.naturalWidth || !image.naturalHeight) return null;

	if (!context) return null;

	let metrics = metricsCache.get(image);
	if (metrics === undefined) {
		const rect = image.getBoundingClientRect();
		if (!rect.width || !rect.height) {
			metricsCache.set(image, null);
			return null;
		}
		const style = window.getComputedStyle(image);
		const fit = style.objectFit === "contain" ? "contain" : "cover";
		const scale =
			fit === "contain"
				? Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight)
				: Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
		const width = image.naturalWidth * scale;
		const height = image.naturalHeight * scale;
		metrics = {
			width,
			height,
			offsetX: rect.left + (rect.width - width) / 2,
			offsetY: rect.top + (rect.height - height) / 2,
		};
		metricsCache.set(image, metrics);
	}
	if (!metrics) return null;

	try {
		context.clearRect(0, 0, 1, 1);
		context.drawImage(
			image,
			metrics.offsetX - x,
			metrics.offsetY - y,
			metrics.width,
			metrics.height,
		);
		const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
		return getColorLuminance(red, green, blue);
	} catch {
		return null;
	}
}

function getBackgroundColorLuminance(color: string) {
	const match = color.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
	if (!match) return null;
	const alpha = Number(match[4] ?? 1);
	if (alpha === 0) return null;
	return getColorLuminance(Number(match[1]), Number(match[2]), Number(match[3]));
}

function getSurfacePointLuminance(
	root: HTMLElement,
	controls: HTMLElement | null,
	x: number,
	y: number,
	surfaceLuminanceCache: Map<HTMLElement, number | null>,
) {
	return (
		document
			.elementsFromPoint(x, y)
			.filter(
				(element): element is HTMLElement =>
					element instanceof HTMLElement && root.contains(element) && !controls?.contains(element),
			)
			.map((element) => {
				if (!surfaceLuminanceCache.has(element)) {
					surfaceLuminanceCache.set(
						element,
						getBackgroundColorLuminance(window.getComputedStyle(element).backgroundColor),
					);
				}
				return surfaceLuminanceCache.get(element) ?? null;
			})
			.find((luminance) => luminance !== null) ?? null
	);
}

function getLayerLuminance(
	context: CanvasRenderingContext2D | null,
	root: HTMLElement,
	target: HTMLElement,
	layers: readonly RenderedLayer[],
	controls: HTMLElement | null,
	imageMetricsCache: Map<HTMLImageElement, ImageMetrics | null>,
	surfaceLuminanceCache: Map<HTMLElement, number | null>,
	paints: readonly PaintLayer[],
) {
	const rect = target.getBoundingClientRect();
	const offsets = [-10, 0, 10];
	const samples = offsets.flatMap((offsetX) =>
		offsets.flatMap((offsetY) => {
			const x = rect.left + rect.width / 2 + offsetX;
			const y = rect.top + rect.height / 2 + offsetY;
			const image = findImageAtPoint(layers, x, y);
			const original =
				(image ? getImagePointLuminance(context, image, x, y, imageMetricsCache) : null) ??
				getSurfacePointLuminance(root, controls, x, y, surfaceLuminanceCache);
			const luminance = paints.reduce(
				(value, paint) => compositePaint(value, paint, x, y),
				original,
			);
			return luminance === null ? [] : [luminance];
		}),
	);
	return samples.length
		? samples.reduce((total, value) => total + value, 0) / samples.length
		: null;
}

/**
 * Samples a 3×3 region of the rendered layer beneath each target.
 * A hysteresis band prevents theme changes while moving across blurred edges.
 */
export function useLayerLuminance(
	rootRef: RefObject<HTMLElement | null>,
	targetRefs: readonly RefObject<HTMLElement | null>[],
	options?: {
		/** Includes explicitly marked, unmasked linear paint layers above images. Defaults to false so source-image measurements do not sample their own overlays. */ includePaintLayers?: boolean;
	},
) {
	const includePaintLayers = options?.includePaintLayers ?? false;
	const [luminances, setLuminances] = useState<(number | null)[]>(() => targetRefs.map(() => null));

	useLayoutEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		const context = canvas.getContext("2d", { willReadFrequently: true });
		let frame = 0;
		let settleTimeout = 0;
		const sync = () => {
			frame = 0;
			const layers = Array.from(
				root.querySelectorAll<HTMLElement>("[data-theme-background-layer], img"),
			).map((element) => ({ element, rect: element.getBoundingClientRect() }));
			const controls = root.querySelector<HTMLElement>("[data-h-scroll-controls]");
			const paints = includePaintLayers ? readPaintLayers(root, controls) : [];
			const imageMetricsCache = new Map<HTMLImageElement, ImageMetrics | null>();
			const surfaceLuminanceCache = new Map<HTMLElement, number | null>();
			// Browser reads belong to this sampling cycle, not a replayable React
			// state updater. Strict Mode can evaluate that updater more than once.
			const luminances = targetRefs.map((targetRef) => {
				const target = targetRef.current;
				return target
					? getLayerLuminance(
							context,
							root,
							target,
							layers,
							controls,
							imageMetricsCache,
							surfaceLuminanceCache,
							paints,
						)
					: null;
			});
			setLuminances((current) => {
				return current.length === luminances.length &&
					current.every((value, index) => value === luminances[index])
					? current
					: luminances;
			});
		};
		const schedule = () => {
			if (!frame) frame = window.requestAnimationFrame(sync);
		};
		const scheduleAfterSettle = () => {
			if (settleTimeout) window.clearTimeout(settleTimeout);
			settleTimeout = window.setTimeout(schedule, SETTLE_DELAY_MS);
		};
		const resizeObserver = new ResizeObserver(schedule);
		const mutationObserver = new MutationObserver(scheduleAfterSettle);
		resizeObserver.observe(root);
		mutationObserver.observe(root, {
			attributes: true,
			attributeFilter: ["style", "class", "data-color-mode"],
			childList: true,
			subtree: true,
		});
		root.addEventListener("scroll", scheduleAfterSettle, true);
		root.querySelectorAll("img").forEach((image) => {
			image.addEventListener("load", schedule);
		});
		const unsubscribeResize = subscribeWindowResize(schedule);
		schedule();

		return () => {
			if (frame) window.cancelAnimationFrame(frame);
			if (settleTimeout) window.clearTimeout(settleTimeout);
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			root.removeEventListener("scroll", scheduleAfterSettle, true);
			root.querySelectorAll("img").forEach((image) => {
				image.removeEventListener("load", schedule);
			});
			unsubscribeResize();
		};
	}, [rootRef, targetRefs, includePaintLayers]);

	return luminances;
}
