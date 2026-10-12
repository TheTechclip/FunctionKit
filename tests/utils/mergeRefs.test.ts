import { render } from "@testing-library/react";
import { createElement, type RefCallback, type RefObject } from "react";
import { describe, expect, test, vi } from "vitest";
import { mergeRefs } from "@/web/packages/utils/mergeRefs";

describe("mergeRefs", () => {
	test("React detaches nested cleanup, legacy and object refs on replacement and unmount", () => {
		const events: string[] = [];
		const cleanupRef: RefCallback<HTMLDivElement> = (node) => {
			if (node === null) throw new Error("cleanup refs must not receive null");
			const id = node.dataset.id;
			events.push(`attach:${id}`);
			return () => {
				events.push(`cleanup:${id}`);
			};
		};
		const legacyRef = vi.fn((node: HTMLDivElement | null) => {
			events.push(node ? `legacy:${node.dataset.id}` : "legacy:null");
		});
		const objectRef: RefObject<HTMLDivElement | null> = { current: null };
		const merged = mergeRefs(mergeRefs(cleanupRef, objectRef), legacyRef);
		const { container, rerender, unmount } = render(
			createElement("div", { key: "first", "data-id": "first", ref: merged }),
		);
		expect(objectRef.current).toBe(container.firstChild);
		rerender(createElement("div", { key: "second", "data-id": "second", ref: merged }));
		expect(objectRef.current).toBe(container.firstChild);
		expect(events).toEqual([
			"attach:first",
			"legacy:first",
			"cleanup:first",
			"legacy:null",
			"attach:second",
			"legacy:second",
		]);
		unmount();
		expect(events.slice(-2)).toEqual(["cleanup:second", "legacy:null"]);
		expect(objectRef.current).toBeNull();
		expect(legacyRef).toHaveBeenCalledTimes(4);
	});

	test("old cleanup cannot clear a replacement attachment and detach is idempotent", () => {
		const cleanup = vi.fn();
		const callback: RefCallback<HTMLDivElement> = () => cleanup;
		const legacy = vi.fn();
		const objectRef: RefObject<HTMLDivElement | null> = { current: null };
		const merged = mergeRefs(callback, legacy, objectRef);
		merged(null);
		expect(legacy).not.toHaveBeenCalled();
		const first = document.createElement("div");
		const second = document.createElement("div");
		const firstCleanup = merged(first);
		const secondCleanup = merged(second);
		if (typeof firstCleanup !== "function" || typeof secondCleanup !== "function") {
			throw new Error("attachments must return React cleanup");
		}
		expect(cleanup).toHaveBeenCalledOnce();
		firstCleanup();
		expect(objectRef.current).toBe(second);
		expect(cleanup).toHaveBeenCalledOnce();
		merged(null);
		merged(null);
		secondCleanup();
		expect(cleanup).toHaveBeenCalledTimes(2);
		expect(legacy.mock.calls).toEqual([[first], [null], [second], [null]]);
		expect(objectRef.current).toBeNull();
	});

	test("object cleanup does not overwrite a ref assigned by another owner", () => {
		const objectRef: RefObject<HTMLDivElement | null> = { current: null };
		const merged = mergeRefs(objectRef);
		merged(document.createElement("div"));
		const replacement = document.createElement("div");
		objectRef.current = replacement;
		merged(null);
		expect(objectRef.current).toBe(replacement);
	});

	test("ref errors propagate rather than silently continuing fan-out", () => {
		const later = vi.fn();
		const error = new Error("ref attachment failed");
		const merged = mergeRefs<HTMLDivElement>(() => {
			throw error;
		}, later);
		expect(() => merged(document.createElement("div"))).toThrow(error);
		expect(later).not.toHaveBeenCalled();
	});

	test("merges multiple refs", () => {
		const ref1 = vi.fn();
		const ref2 = { current: null };
		const ref3 = null;

		const merged = mergeRefs<HTMLDivElement>(ref1, ref2, ref3);
		const element = document.createElement("div");

		merged(element);

		expect(ref1).toHaveBeenCalledWith(element);
		expect(ref2.current).toBe(element);
	});

	test("handles all null refs", () => {
		const merged = mergeRefs<HTMLDivElement>(null, undefined, null);
		const element = document.createElement("div");
		expect(() => merged(element)).not.toThrow();
	});

	test("handles empty refs array", () => {
		const merged = mergeRefs<HTMLDivElement>();
		const element = document.createElement("div");
		expect(() => merged(element)).not.toThrow();
	});

	test("handles all callback refs", () => {
		const ref1 = vi.fn();
		const ref2 = vi.fn();
		const merged = mergeRefs<HTMLDivElement>(ref1, ref2);
		const element = document.createElement("div");
		merged(element);
		expect(ref1).toHaveBeenCalledWith(element);
		expect(ref2).toHaveBeenCalledWith(element);
	});

	test("handles all object refs", () => {
		const ref1 = { current: null };
		const ref2 = { current: null };
		const merged = mergeRefs<HTMLDivElement>(ref1, ref2);
		const element = document.createElement("div");
		merged(element);
		expect(ref1.current).toBe(element);
		expect(ref2.current).toBe(element);
	});
});
