import { afterEach, describe, expect, test, vi } from "vitest";
import {
	subscribeViewportGeometry,
	subscribeViewportResize,
	subscribeViewportScroll,
	subscribeVisualViewportResize,
	subscribeVisualViewportScroll,
	subscribeWindowResize,
	subscribeWindowScroll,
} from "@/web/packages/utils/browser/sharedBrowserEvents";

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("shared browser event subscriptions", () => {
	test("identical callbacks have independent owners and final-owner cleanup", () => {
		const add = vi.spyOn(window, "addEventListener");
		const remove = vi.spyOn(window, "removeEventListener");
		const listener = vi.fn();
		const first = subscribeWindowResize(listener);
		const second = subscribeWindowResize(listener);
		expect(add).toHaveBeenCalledTimes(1);
		window.dispatchEvent(new Event("resize"));
		expect(listener).toHaveBeenCalledTimes(2);
		first();
		first();
		expect(remove).not.toHaveBeenCalled();
		window.dispatchEvent(new Event("resize"));
		expect(listener).toHaveBeenCalledTimes(3);
		second();
		second();
		expect(remove).toHaveBeenCalledTimes(1);
	});

	test("an old unsubscribe cannot remove a re-subscribed callback", () => {
		const listener = vi.fn();
		const first = subscribeWindowResize(listener);
		first();
		const remove = vi.spyOn(window, "removeEventListener");
		const second = subscribeWindowResize(listener);
		first();
		window.dispatchEvent(new Event("resize"));
		expect(listener).toHaveBeenCalledOnce();
		expect(remove).not.toHaveBeenCalled();
		second();
		expect(remove).toHaveBeenCalledOnce();
	});

	test("dispatch snapshots owners before callback subscription changes", () => {
		const later = vi.fn();
		const removed = vi.fn();
		let removeSecond: () => void;
		let removeLater: (() => void) | undefined;
		const first = subscribeWindowResize(() => {
			removeSecond();
			removeLater = subscribeWindowResize(later);
		});
		removeSecond = subscribeWindowResize(removed);
		window.dispatchEvent(new Event("resize"));
		expect(removed).toHaveBeenCalledOnce();
		expect(later).not.toHaveBeenCalled();
		first();
		window.dispatchEvent(new Event("resize"));
		expect(removed).toHaveBeenCalledOnce();
		expect(later).toHaveBeenCalledOnce();
		if (!removeLater) throw new Error("Expected the later subscription to exist");
		removeLater();
	});

	test("shares one window listener until the final subscriber leaves", () => {
		const add = vi.spyOn(window, "addEventListener");
		const remove = vi.spyOn(window, "removeEventListener");
		const first = vi.fn();
		const second = vi.fn();
		const unsubscribeFirst = subscribeWindowResize(first);
		const unsubscribeSecond = subscribeWindowResize(second);

		expect(add).toHaveBeenCalledTimes(1);
		const resizeEvent = new Event("resize");
		window.dispatchEvent(resizeEvent);
		expect(first).toHaveBeenCalledExactlyOnceWith(resizeEvent);
		expect(second).toHaveBeenCalledOnce();

		unsubscribeFirst();
		expect(remove).not.toHaveBeenCalled();
		window.dispatchEvent(new Event("resize"));
		expect(first).toHaveBeenCalledOnce();
		expect(second).toHaveBeenCalledTimes(2);

		unsubscribeSecond();
		expect(remove).toHaveBeenCalledTimes(1);
		unsubscribeSecond();
		expect(remove).toHaveBeenCalledTimes(1);
	});

	test("combines viewport geometry channels with explicit window capture and orientation", () => {
		const viewport = new EventTarget() as VisualViewport;
		Object.defineProperty(window, "visualViewport", {
			configurable: true,
			value: viewport,
		});
		const windowAdd = vi.spyOn(window, "addEventListener");
		const listener = vi.fn();
		const unsubscribe = subscribeViewportGeometry(listener, {
			orientation: true,
			windowScroll: true,
			windowScrollCapture: true,
		});

		expect(windowAdd).toHaveBeenCalledWith("scroll", expect.any(Function), true);
		expect(windowAdd).toHaveBeenCalledWith("orientationchange", expect.any(Function));
		const scrollEvent = new Event("scroll");
		viewport.dispatchEvent(scrollEvent);
		expect(listener).toHaveBeenCalledWith(scrollEvent);
		unsubscribe();
	});

	test("supports visual-only and empty viewport scroll subscriptions", () => {
		const viewport = new EventTarget() as VisualViewport;
		Object.defineProperty(window, "visualViewport", {
			configurable: true,
			value: viewport,
		});
		const listener = vi.fn();
		const visual = subscribeViewportScroll(listener);
		viewport.dispatchEvent(new Event("scroll"));
		expect(listener).toHaveBeenCalledOnce();
		visual();
		expect(() => subscribeViewportScroll(listener, { visual: false })()).not.toThrow();
	});

	test("combines resize, scroll and opt-in orientation for viewport geometry", () => {
		const viewport = new EventTarget() as VisualViewport;
		Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
		const add = vi.spyOn(window, "addEventListener");
		const remove = vi.spyOn(window, "removeEventListener");
		const viewportRemove = vi.spyOn(viewport, "removeEventListener");
		const listener = vi.fn();

		const unsubscribe = subscribeViewportGeometry(listener, {
			orientation: true,
			windowScroll: true,
			windowScrollCapture: true,
		});
		expect(add).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(add).toHaveBeenCalledWith("scroll", expect.any(Function), true);
		expect(add).toHaveBeenCalledWith("orientationchange", expect.any(Function));

		for (const [target, type] of [
			[window, "resize"],
			[window, "scroll"],
			[window, "orientationchange"],
			[viewport, "resize"],
			[viewport, "scroll"],
		] as const) {
			target.dispatchEvent(new Event(type));
		}
		expect(listener).toHaveBeenCalledTimes(5);

		unsubscribe();
		expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function), true);
		expect(remove).toHaveBeenCalledWith("orientationchange", expect.any(Function));
		expect(viewportRemove).toHaveBeenCalledWith("scroll", expect.any(Function));
	});

	test("keeps viewport geometry to resize and visual scroll by default", () => {
		const viewport = new EventTarget() as VisualViewport;
		Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
		const add = vi.spyOn(window, "addEventListener");
		const listener = vi.fn();

		const unsubscribe = subscribeViewportGeometry(listener);
		expect(add).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(add).not.toHaveBeenCalledWith("scroll", expect.any(Function));
		expect(add).not.toHaveBeenCalledWith("orientationchange", expect.any(Function));
		viewport.dispatchEvent(new Event("scroll"));
		expect(listener).toHaveBeenCalledOnce();
		unsubscribe();
	});

	test("keeps capture and bubble scroll channels independent", () => {
		const add = vi.spyOn(window, "addEventListener");
		const remove = vi.spyOn(window, "removeEventListener");
		const bubble = subscribeWindowScroll(vi.fn());
		const capture = subscribeWindowScroll(vi.fn(), true);

		expect(add).toHaveBeenCalledWith("scroll", expect.any(Function));
		expect(add).toHaveBeenCalledWith("scroll", expect.any(Function), true);
		bubble();
		capture();
		expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
		expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function), true);
	});

	test("replaces a stale channel when the event target changes", () => {
		const originalWindow = window;
		const remove = vi.spyOn(originalWindow, "removeEventListener");
		const listener = vi.fn();
		const unsubscribeOriginal = subscribeWindowResize(listener);
		const replacement = new EventTarget() as Window & typeof globalThis;
		const replacementAdd = vi.spyOn(replacement, "addEventListener");
		const replacementRemove = vi.spyOn(replacement, "removeEventListener");

		vi.stubGlobal("window", replacement);
		const unsubscribeReplacement = subscribeWindowResize(listener);
		expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(replacementAdd).toHaveBeenCalledWith("resize", expect.any(Function));

		unsubscribeOriginal();
		unsubscribeOriginal();
		expect(replacementRemove).not.toHaveBeenCalled();
		originalWindow.dispatchEvent(new Event("resize"));
		expect(listener).not.toHaveBeenCalled();
		replacement.dispatchEvent(new Event("resize"));
		expect(listener).toHaveBeenCalledOnce();
		unsubscribeReplacement();
		expect(replacementRemove).toHaveBeenCalledWith("resize", expect.any(Function));
	});

	test("supports visualViewport resize/scroll and the combined viewport subscription", () => {
		const viewport = new EventTarget() as VisualViewport;
		Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
		const viewportAdd = vi.spyOn(viewport, "addEventListener");
		const viewportRemove = vi.spyOn(viewport, "removeEventListener");
		const windowAdd = vi.spyOn(window, "addEventListener");
		const listener = vi.fn();

		const resize = subscribeVisualViewportResize(listener);
		const scroll = subscribeVisualViewportScroll(listener);
		const combined = subscribeViewportResize(listener);
		expect(viewportAdd).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(viewportAdd).toHaveBeenCalledWith("scroll", expect.any(Function));
		expect(windowAdd).toHaveBeenCalledWith("resize", expect.any(Function));

		viewport.dispatchEvent(new Event("scroll"));
		expect(listener).toHaveBeenCalled();
		resize();
		scroll();
		combined();
		expect(viewportRemove).toHaveBeenCalled();
	});

	test("returns harmless no-op unsubscribers when browser targets are unavailable", () => {
		const originalWindow = window;
		vi.stubGlobal("window", undefined);
		expect(() => subscribeWindowResize(vi.fn())()).not.toThrow();
		expect(() => subscribeWindowScroll(vi.fn())()).not.toThrow();
		expect(() => subscribeVisualViewportResize(vi.fn())()).not.toThrow();
		expect(() => subscribeVisualViewportScroll(vi.fn())()).not.toThrow();
		expect(() => subscribeViewportScroll(vi.fn(), { window: true })()).not.toThrow();
		expect(() => subscribeViewportGeometry(vi.fn(), { orientation: true })()).not.toThrow();
		vi.stubGlobal("window", originalWindow);

		Object.defineProperty(window, "visualViewport", { configurable: true, value: undefined });
		expect(() => subscribeVisualViewportResize(vi.fn())()).not.toThrow();
	});
	test("removes capture listeners with their options when a scroll target is replaced", () => {
		const originalWindow = window;
		const remove = vi.spyOn(originalWindow, "removeEventListener");
		const first = subscribeWindowScroll(vi.fn(), true);
		const replacement = new EventTarget() as Window & typeof globalThis;
		vi.stubGlobal("window", replacement);
		const second = subscribeWindowScroll(vi.fn(), true);
		expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function), true);
		first();
		second();
	});

	test("moves a visual viewport channel when the viewport object is replaced", () => {
		const original = new EventTarget() as VisualViewport;
		const replacement = new EventTarget() as VisualViewport;
		Object.defineProperty(window, "visualViewport", {
			configurable: true,
			value: original,
		});
		const originalRemove = vi.spyOn(original, "removeEventListener");
		const first = subscribeVisualViewportScroll(vi.fn());
		Object.defineProperty(window, "visualViewport", {
			configurable: true,
			value: replacement,
		});
		const replacementAdd = vi.spyOn(replacement, "addEventListener");
		const second = subscribeVisualViewportScroll(vi.fn());

		expect(originalRemove).toHaveBeenCalledWith("scroll", expect.any(Function));
		expect(replacementAdd).toHaveBeenCalledWith("scroll", expect.any(Function));
		first();
		second();
	});
});
