import { describe, test, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardListNavigation } from "@/packages/hooks/useKeyboardListNavigation";

describe("useKeyboardListNavigation", () => {
	test("initializes with activeIndex -1", () => {
		const { result } = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 3 }),
		);
		expect(result.current.activeIndex).toBe(-1);
	});

	test("handleListKeyDown with ArrowDown moves to first item when none active", () => {
		const { result } = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 3 }),
		);

		const container = document.createElement("div");
		const items = [0, 1, 2].map(() => {
			const el = document.createElement("div");
			el.setAttribute("tabindex", "-1");
			el.scrollIntoView = vi.fn();
			container.appendChild(el);
			return el;
		});
		items.forEach((el, i) => result.current.setItemRef(i, el));

		const event = {
			key: "ArrowDown",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => { result.current.handleListKeyDown(event); });
		expect(result.current.activeIndex).toBe(0);
	});

	test("handleListKeyDown with ArrowUp moves to previous item", () => {
		const { result } = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 3 }),
		);

		const container = document.createElement("div");
		const items = [0, 1, 2].map(() => {
			const el = document.createElement("div");
			el.setAttribute("tabindex", "-1");
			el.scrollIntoView = vi.fn();
			container.appendChild(el);
			return el;
		});
		items.forEach((el, i) => result.current.setItemRef(i, el));
		act(() => { result.current.setActiveIndex(1); });

		const event = {
			key: "ArrowUp",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => { result.current.handleListKeyDown(event); });
		expect(result.current.activeIndex).toBe(0);
	});

	test("Escape resets activeIndex to -1", () => {
		const { result } = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 3 }),
		);

		const event = {
			key: "Escape",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: document.createElement("div"),
		} as unknown as React.KeyboardEvent<HTMLElement>;

		result.current.setActiveIndex(1);
		act(() => { result.current.handleListKeyDown(event); });
		expect(result.current.activeIndex).toBe(-1);
	});
});
