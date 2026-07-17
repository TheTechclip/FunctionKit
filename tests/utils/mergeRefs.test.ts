import { describe, expect, test, vi } from "vitest";
import { mergeRefs } from "@/packages/utils/mergeRefs";

describe("mergeRefs", () => {
	test("merges multiple refs", () => {
		const ref1 = vi.fn();
		const ref2 = { current: null };
		const ref3 = null;

		const merged = mergeRefs(ref1, ref2, ref3);
		const element = document.createElement("div");

		merged(element);

		expect(ref1).toHaveBeenCalledWith(element);
		expect(ref2.current).toBe(element);
	});

	test("handles all null refs", () => {
		const merged = mergeRefs(null, undefined, null);
		const element = document.createElement("div");
		expect(() => merged(element)).not.toThrow();
	});

	test("handles empty refs array", () => {
		const merged = mergeRefs();
		const element = document.createElement("div");
		expect(() => merged(element)).not.toThrow();
	});

	test("handles all callback refs", () => {
		const ref1 = vi.fn();
		const ref2 = vi.fn();
		const merged = mergeRefs(ref1, ref2);
		const element = document.createElement("div");
		merged(element);
		expect(ref1).toHaveBeenCalledWith(element);
		expect(ref2).toHaveBeenCalledWith(element);
	});

	test("handles all object refs", () => {
		const ref1 = { current: null };
		const ref2 = { current: null };
		const merged = mergeRefs(ref1, ref2);
		const element = document.createElement("div");
		merged(element);
		expect(ref1.current).toBe(element);
		expect(ref2.current).toBe(element);
	});
});
