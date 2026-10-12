import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useViewportMatch } from "@/web/packages/hooks/useViewportMatch";

function MatchStatus({ mediaQuery }: { mediaQuery: string }) {
	const isMatched = useViewportMatch(mediaQuery);
	return createElement("output", { "data-matched": isMatched });
}

describe("useViewportMatch", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			})),
		);
	});

	test("returns false initially", () => {
		const { result } = renderHook(() => useViewportMatch("(min-width: 768px)"));
		expect(result.current).toBe(false);
	});

	test("returns true when matched", () => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation(() => ({
				matches: true,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			})),
		);
		const { result } = renderHook(() => useViewportMatch("(min-width: 768px)"));
		expect(result.current).toBe(true);
	});

	test("synchronizes a 430px mobile match during hydration", () => {
		const mediaQueryList = {
			matches: true,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		};
		vi.stubGlobal(
			"matchMedia",
			vi.fn(() => mediaQueryList),
		);

		const mediaQuery = "(max-width: 767.98px)";
		const serverMarkup = renderToString(createElement(MatchStatus, { mediaQuery }));
		expect(serverMarkup).toContain('data-matched="false"');

		const container = document.createElement("div");
		container.innerHTML = serverMarkup;
		document.body.append(container);

		let root: ReturnType<typeof hydrateRoot> | undefined;
		act(() => {
			root = hydrateRoot(container, createElement(MatchStatus, { mediaQuery }));
		});

		expect(container.querySelector("output")).toHaveAttribute("data-matched", "true");
		expect(window.matchMedia).toHaveBeenCalledWith(mediaQuery);

		act(() => root?.unmount());
		container.remove();
	});
	test("shares a media-query listener and detaches it after the final consumer", () => {
		let matches = false;
		let change: (() => void) | undefined;
		const mediaQueryList = {
			get matches() {
				return matches;
			},
			addEventListener: vi.fn((_event: string, listener: () => void) => {
				change = listener;
			}),
			removeEventListener: vi.fn(),
		};
		vi.stubGlobal(
			"matchMedia",
			vi.fn(() => mediaQueryList),
		);

		const first = renderHook(() => useViewportMatch("(min-width: 900px)"));
		const second = renderHook(() => useViewportMatch("(min-width: 900px)"));
		expect(mediaQueryList.addEventListener).toHaveBeenCalledOnce();

		matches = true;
		act(() => change?.());
		expect(first.result.current).toBe(true);
		expect(second.result.current).toBe(true);

		first.unmount();
		expect(mediaQueryList.removeEventListener).not.toHaveBeenCalled();
		second.unmount();
		expect(mediaQueryList.removeEventListener).toHaveBeenCalledOnce();
	});

	test("falls back to false without matchMedia and resets stores when the implementation changes", () => {
		Object.defineProperty(window, "matchMedia", { configurable: true, value: undefined });
		const missing = renderHook(() => useViewportMatch("(min-width: 1px)"));
		expect(missing.result.current).toBe(false);
		missing.unmount();

		const firstList = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
		const firstMatchMedia = vi.fn(() => firstList);
		Object.defineProperty(window, "matchMedia", { configurable: true, value: firstMatchMedia });
		const first = renderHook(() => useViewportMatch("(width: 10px)"));

		const secondList = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() };
		const secondMatchMedia = vi.fn(() => secondList);
		Object.defineProperty(window, "matchMedia", { configurable: true, value: secondMatchMedia });
		const second = renderHook(() => useViewportMatch("(width: 20px)"));
		expect(second.result.current).toBe(true);
		expect(firstList.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));

		first.unmount();
		second.unmount();
	});
});
