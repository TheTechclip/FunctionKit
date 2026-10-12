import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { useScrollLock } from "@/web/public";

function touchEvent(type: "touchstart" | "touchmove", clientY: number) {
	const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
	Object.defineProperty(event, "touches", {
		configurable: true,
		value: [{ clientY }],
	});
	return event;
}

function makeScrollable(element: HTMLElement, values: { height: number; scrollHeight: number }) {
	element.style.overflowY = "auto";
	Object.defineProperty(element, "clientHeight", {
		configurable: true,
		value: values.height,
	});
	Object.defineProperty(element, "scrollHeight", {
		configurable: true,
		value: values.scrollHeight,
	});
}

afterEach(() => {
	document.body.style.overflow = "";
	document.body.style.overscrollBehavior = "";
	document.documentElement.style.overflow = "";
	document.documentElement.style.overscrollBehavior = "";
});

describe("useScrollLock", () => {
	test("handles empty touch lists while keeping body overscroll blocked", () => {
		const { unmount } = renderHook(() => useScrollLock(true));
		for (const type of ["touchstart", "touchmove"]) {
			const event = new Event(type, { bubbles: true, cancelable: true });
			Object.defineProperty(event, "touches", { value: [] });
			document.dispatchEvent(event);
			if (type === "touchmove") expect(event.defaultPrevented).toBe(true);
		}
		unmount();
		expect(document.body.style.overflow).toBe("");
	});
	test("locks body and document when enabled", () => {
		renderHook(() => useScrollLock(true));
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.documentElement.style.overflow).toBe("hidden");
	});

	test("does not lock when disabled", () => {
		renderHook(() => useScrollLock(false));
		expect(document.body.style.overflow).toBe("");
	});

	test("restores styles on cleanup", () => {
		document.body.style.overflow = "clip";
		document.body.style.overscrollBehavior = "contain";
		document.documentElement.style.overflow = "scroll";
		document.documentElement.style.overscrollBehavior = "auto";
		const { unmount } = renderHook(() => useScrollLock(true));
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.body.style.overscrollBehavior).toBe("none");
		expect(document.documentElement.style.overflow).toBe("hidden");
		expect(document.documentElement.style.overscrollBehavior).toBe("none");
		unmount();
		expect(document.body.style.overflow).toBe("clip");
		expect(document.body.style.overscrollBehavior).toBe("contain");
		expect(document.documentElement.style.overflow).toBe("scroll");
		expect(document.documentElement.style.overscrollBehavior).toBe("auto");
	});

	test("keeps the global lock until the final consumer releases it", () => {
		document.body.style.overflow = "clip";
		const first = renderHook(() => useScrollLock(true));
		const second = renderHook(() => useScrollLock(true));

		first.unmount();
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.documentElement.style.overflow).toBe("hidden");

		second.unmount();
		expect(document.body.style.overflow).toBe("clip");
		expect(document.documentElement.style.overflow).toBe("");
	});

	test("releases and reacquires the effect lock when enabled changes", () => {
		const { rerender, unmount } = renderHook(({ locked }) => useScrollLock(locked), {
			initialProps: { locked: false },
		});

		expect(document.body.style.overflow).toBe("");
		rerender({ locked: true });
		expect(document.body.style.overflow).toBe("hidden");
		rerender({ locked: false });
		expect(document.body.style.overflow).toBe("");
		rerender({ locked: true });
		expect(document.body.style.overflow).toBe("hidden");

		unmount();
		expect(document.body.style.overflow).toBe("");
	});

	test("supports explicitly paired imperative locks", () => {
		const { result, unmount } = renderHook(() => useScrollLock(false));

		result.current.lockScroll();
		expect(document.body.style.overflow).toBe("hidden");
		result.current.openScroll();
		expect(document.body.style.overflow).toBe("");

		unmount();
	});

	test("prevents touch movement when there is no scrollable ancestor", () => {
		const { unmount } = renderHook(() => useScrollLock(true));
		const child = document.createElement("div");
		document.body.appendChild(child);

		child.dispatchEvent(touchEvent("touchstart", 100));
		const move = touchEvent("touchmove", 80);
		child.dispatchEvent(move);

		expect(move.defaultPrevented).toBe(true);
		child.remove();
		unmount();
	});

	test("allows scrolling inside a scrollable ancestor but blocks boundary overscroll", () => {
		const { unmount } = renderHook(() => useScrollLock(true));
		const scrollable = document.createElement("div");
		const child = document.createElement("div");
		makeScrollable(scrollable, { height: 100, scrollHeight: 300 });
		scrollable.appendChild(child);
		document.body.appendChild(scrollable);

		scrollable.scrollTop = 100;
		child.dispatchEvent(touchEvent("touchstart", 100));
		const interiorMove = touchEvent("touchmove", 80);
		child.dispatchEvent(interiorMove);
		expect(interiorMove.defaultPrevented).toBe(false);

		scrollable.scrollTop = 0;
		child.dispatchEvent(touchEvent("touchstart", 100));
		const topOverscroll = touchEvent("touchmove", 120);
		child.dispatchEvent(topOverscroll);
		expect(topOverscroll.defaultPrevented).toBe(true);

		scrollable.scrollTop = 200;
		child.dispatchEvent(touchEvent("touchstart", 100));
		const bottomOverscroll = touchEvent("touchmove", 80);
		child.dispatchEvent(bottomOverscroll);
		expect(bottomOverscroll.defaultPrevented).toBe(true);

		scrollable.remove();
		unmount();
	});
	test("ignores an unmatched imperative release", () => {
		const { result } = renderHook(() => useScrollLock(false));
		expect(() => result.current.openScroll()).not.toThrow();
		expect(document.body.style.overflow).toBe("");
	});

	test("blocks touch movement from non-element and non-HTMLElement targets", () => {
		const { unmount } = renderHook(() => useScrollLock(true));
		const documentMove = touchEvent("touchmove", 80);
		document.dispatchEvent(documentMove);
		expect(documentMove.defaultPrevented).toBe(true);

		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		document.body.append(svg);
		const svgMove = touchEvent("touchmove", 80);
		svg.dispatchEvent(svgMove);
		expect(svgMove.defaultPrevented).toBe(true);
		svg.remove();
		unmount();
	});
});
