import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory } from "../../web/packages/utils/memoryHistory";

describe("createMemoryHistory", () => {
	it("tracks direction, position, and forward-branch replacement", () => {
		const history = createMemoryHistory("list");
		history.push("details");
		history.push("price");
		history.back();

		expect(history.read()).toBe("details");
		expect(history.getNavigation()).toEqual({
			direction: "backward",
			revision: 3,
			position: 1,
		});

		history.push("notes");
		expect(history.getStack()).toEqual(["list", "details", "notes"]);
	});

	it("notifies subscribers only when the history changes", () => {
		const history = createMemoryHistory("list");
		const listener = vi.fn();
		const unsubscribe = history.subscribe(listener);

		history.back();
		expect(listener).not.toHaveBeenCalled();

		history.replace("root");
		history.push("details");
		history.reset("list");
		expect(listener).toHaveBeenCalledTimes(3);

		unsubscribe();
		history.push("details");
		expect(listener).toHaveBeenCalledTimes(3);
	});
	it("tracks forward navigation through go and clamps no-op deltas", () => {
		const history = createMemoryHistory("a");
		history.push("b");
		history.push("c");
		history.go(-2);
		expect(history.read()).toBe("a");
		history.go(1);
		expect(history.read()).toBe("b");
		expect(history.getNavigation().direction).toBe("forward");
		const revision = history.getNavigation().revision;
		history.go(0);
		history.go(999);
		expect(history.read()).toBe("c");
		expect(history.getNavigation().revision).toBeGreaterThan(revision);
	});
});
