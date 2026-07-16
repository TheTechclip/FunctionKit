import { describe, test, expect, vi } from "vitest";
import { mergeRefs } from "@/packages/utils/mergeRefs";

describe("mergeRefs", () => {
	test("merges multiple refs", () => {
		const ref1 = vi.fn();
		const ref2 = { current: null };
		const ref3 = null;

		const merged = mergeRefs(ref1, ref2, ref3);
		const element = document.createElement("div");

		merged(element as any);

		expect(ref1).toHaveBeenCalledWith(element);
		expect(ref2.current).toBe(element);
	});
});
