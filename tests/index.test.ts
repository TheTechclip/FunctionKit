import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createMemoryHistory, debounce, parseClientCookieNames } from "@/web/public";

describe("public package entry point", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test("exposes a cancellable trailing debounce through the package root", () => {
		const callback = vi.fn();
		const debounced = debounce(callback, 100, { edges: ["trailing"] });

		debounced("first");
		vi.advanceTimersByTime(50);
		debounced("latest");
		vi.advanceTimersByTime(99);
		expect(callback).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith("latest");

		debounced("cancelled");
		debounced.cancel();
		vi.runAllTimers();
		expect(callback).toHaveBeenCalledOnce();
	});

	test("exposes history with back navigation and forward-branch truncation", () => {
		const history = createMemoryHistory("list");
		const listener = vi.fn();
		const unsubscribe = history.subscribe(listener);

		history.push("details");
		history.push("price");
		history.back();
		history.push("notes");

		expect(history.read()).toBe("notes");
		expect(history.getStack()).toEqual(["list", "details", "notes"]);
		expect(history.getNavigation()).toMatchObject({
			direction: "forward",
			position: 2,
		});
		expect(listener).toHaveBeenCalledTimes(4);

		unsubscribe();
		history.replace("memo");
		expect(listener).toHaveBeenCalledTimes(4);
	});

	test("exposes cookie-name parsing without accepting malformed empty names", () => {
		expect(parseClientCookieNames("foo=1; =bad; token=a%3Db; flag")).toEqual([
			"foo",
			"token",
			"flag",
		]);
	});
});
