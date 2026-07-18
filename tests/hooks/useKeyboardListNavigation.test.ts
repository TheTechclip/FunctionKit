import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useKeyboardListNavigation } from "@/packages/hooks/useKeyboardListNavigation";

describe("useKeyboardListNavigation", () => {
	test("initializes with activeIndex -1", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));
		expect(result.current.activeIndex).toBe(-1);
	});

	test("handleListKeyDown with ArrowDown moves to first item when none active", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const items = [0, 1, 2].map(() => {
			const el = document.createElement("div");
			el.setAttribute("tabindex", "-1");
			el.scrollIntoView = vi.fn();
			container.appendChild(el);
			return el;
		});
		items.forEach((el, i) => {
			result.current.setItemRef(i, el);
		});

		const event = {
			key: "ArrowDown",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(0);
	});

	test("handleListKeyDown with ArrowUp moves to previous item", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const items = [0, 1, 2].map(() => {
			const el = document.createElement("div");
			el.setAttribute("tabindex", "-1");
			el.scrollIntoView = vi.fn();
			container.appendChild(el);
			return el;
		});
		items.forEach((el, i) => {
			result.current.setItemRef(i, el);
		});
		act(() => {
			result.current.setActiveIndex(1);
		});

		const event = {
			key: "ArrowUp",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(0);
	});

	test("ArrowDown moves to next item when one is active", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const items = [0, 1, 2].map(() => {
			const el = document.createElement("div");
			el.setAttribute("tabindex", "-1");
			el.scrollIntoView = vi.fn();
			container.appendChild(el);
			return el;
		});
		items.forEach((el, i) => {
			result.current.setItemRef(i, el);
		});
		act(() => {
			result.current.setActiveIndex(0);
		});

		const event = {
			key: "ArrowDown",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(1);
	});

	test("ArrowUp with no active index goes to last item", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const items = [0, 1, 2].map(() => {
			const el = document.createElement("div");
			el.setAttribute("tabindex", "-1");
			el.scrollIntoView = vi.fn();
			container.appendChild(el);
			return el;
		});
		items.forEach((el, i) => {
			result.current.setItemRef(i, el);
		});

		const event = {
			key: "ArrowUp",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(2);
	});

	test("unrecognized key passes preventDefault and falls through", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const input = document.createElement("input");
		container.appendChild(input);

		const event = {
			key: "Tab",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	test("clickActiveItem returns false when no active index", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));
		expect(result.current.clickActiveItem()).toBe(false);
	});

	test("focusBoundaryItem returns false when itemCount is 0", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 0 }));
		expect(result.current.focusBoundaryItem("ArrowDown")).toBe(false);
	});

	test("moveActiveItem is safe to call directly for an empty list", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 0 }));
		expect(result.current.moveActiveItem("ArrowDown")).toBe(false);
		expect(result.current.activeIndex).toBe(-1);
	});

	test("clamps the active index when the item count shrinks and resets it when empty", () => {
		const { result, rerender } = renderHook(
			({ itemCount }) => useKeyboardListNavigation({ itemCount }),
			{ initialProps: { itemCount: 3 } },
		);

		act(() => {
			result.current.setActiveIndex(2);
		});
		rerender({ itemCount: 2 });
		expect(result.current.activeIndex).toBe(1);
		rerender({ itemCount: 0 });
		expect(result.current.activeIndex).toBe(-1);
	});

	test("focusBoundaryItem returns false for unmatched key", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));
		expect(result.current.focusBoundaryItem("Tab")).toBe(false);
	});

	test("focusBoundaryItem returns false when target ref is missing", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));
		expect(result.current.focusBoundaryItem("ArrowDown")).toBe(false);
	});

	test("focusBoundaryItem returns true for Home through moveActiveItem fallthrough", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));
		const item0 = document.createElement("div");
		item0.setAttribute("tabindex", "-1");
		item0.focus = vi.fn();
		item0.scrollIntoView = vi.fn();
		result.current.setItemRef(0, item0);

		const event = {
			key: "Home",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: document.createElement("div"),
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(0);
	});

	test("handleListKeyDown with null target returns early", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const event = {
			key: "ArrowDown",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: null,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(-1);
	});

	test("Enter key on active item calls clickActiveItem", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const items = [0, 1, 2].map(() => {
			const el = document.createElement("div");
			el.setAttribute("tabindex", "-1");
			el.scrollIntoView = vi.fn();
			el.click = vi.fn();
			container.appendChild(el);
			return el;
		});
		items.forEach((el, i) => {
			result.current.setItemRef(i, el);
		});

		act(() => {
			result.current.setActiveIndex(1);
		});

		const event = {
			key: "Enter",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(items[1].click).toHaveBeenCalledOnce();
	});

	test("Space key on active item calls clickActiveItem", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const items = [0, 1, 2].map(() => {
			const el = document.createElement("div");
			el.setAttribute("tabindex", "-1");
			el.scrollIntoView = vi.fn();
			el.click = vi.fn();
			container.appendChild(el);
			return el;
		});
		items.forEach((el, i) => {
			result.current.setItemRef(i, el);
		});

		act(() => {
			result.current.setActiveIndex(1);
		});

		const event = {
			key: " ",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(items[1].click).toHaveBeenCalledOnce();
	});

	test("Home key focuses first item when no active index", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const item0 = document.createElement("div");
		item0.setAttribute("tabindex", "-1");
		item0.scrollIntoView = vi.fn();
		item0.focus = vi.fn();
		container.appendChild(item0);
		result.current.setItemRef(0, item0);

		const event = {
			key: "Home",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(0);
	});

	test("returns early when itemCount is 0", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 0 }));

		const event = {
			key: "ArrowDown",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: document.createElement("div"),
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(-1);
	});

	test("returns early when event is defaultPrevented", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const event = {
			key: "ArrowDown",
			defaultPrevented: true,
			preventDefault: vi.fn(),
			target: document.createElement("div"),
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(-1);
	});

	test("ignores events on editable target", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const input = document.createElement("input");
		container.appendChild(input);

		const event = {
			key: "ArrowDown",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: input,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(-1);
	});

	test("ignores events outside container", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const outside = document.createElement("div");
		document.body.appendChild(outside);

		const event = {
			key: "ArrowDown",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: outside,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event, { container });
		});
		expect(result.current.activeIndex).toBe(-1);
	});

	test("End key focuses last item via focusBoundaryItem", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const container = document.createElement("div");
		const items = [0, 1, 2].map(() => {
			const el = document.createElement("div");
			el.setAttribute("tabindex", "-1");
			el.scrollIntoView = vi.fn();
			el.focus = vi.fn();
			container.appendChild(el);
			return el;
		});
		items.forEach((el, i) => {
			result.current.setItemRef(i, el);
		});

		// Set activeIndex to 0 so ArrowUp falls through to focusBoundaryItem
		act(() => {
			result.current.setActiveIndex(0);
		});

		const event = {
			key: "End",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: container,
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(2);
	});

	test("Escape resets activeIndex to -1", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));

		const event = {
			key: "Escape",
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: document.createElement("div"),
		} as unknown as React.KeyboardEvent<HTMLElement>;

		result.current.setActiveIndex(1);
		act(() => {
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(-1);
	});
});
