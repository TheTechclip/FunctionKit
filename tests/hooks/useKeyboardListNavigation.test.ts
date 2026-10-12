import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useKeyboardListNavigation } from "@/web/packages/hooks/useKeyboardListNavigation";

describe("useKeyboardListNavigation", () => {
	test("unmounted items without a text provider cannot match typeahead", () => {
		const { result } = renderHook(() =>
			useKeyboardListNavigation({
				itemCount: 2,
				typeahead: true,
				allowUnmountedItems: true,
				focusOnMove: false,
			}),
		);
		const preventDefault = vi.fn();
		act(() =>
			result.current.handleListKeyDown({
				key: "a",
				defaultPrevented: false,
				preventDefault,
				target: document.body,
			} as unknown as React.KeyboardEvent<HTMLElement>),
		);
		expect(result.current.activeIndex).toBe(-1);
		expect(preventDefault).not.toHaveBeenCalled();
	});
	test("initializes with activeIndex -1", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));
		expect(result.current.activeIndex).toBe(-1);
	});

	test("supports a controlled active index", () => {
		const onActiveIndexChange = vi.fn();
		const { result } = renderHook(() =>
			useKeyboardListNavigation({
				itemCount: 2,
				activeIndex: 0,
				onActiveIndexChange,
			}),
		);
		const first = document.createElement("button");
		const second = document.createElement("button");
		first.scrollIntoView = vi.fn();
		second.scrollIntoView = vi.fn();
		result.current.setItemRef(0, first);
		result.current.setItemRef(1, second);

		act(() => result.current.moveActiveItem("ArrowDown"));
		expect(result.current.activeIndex).toBe(0);
		expect(onActiveIndexChange).toHaveBeenCalledWith(1);
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

	test("can move the active descendant without moving DOM focus", () => {
		const { result } = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 2, focusOnMove: false }),
		);
		const input = document.createElement("input");
		const item = document.createElement("button");
		item.scrollIntoView = vi.fn();
		document.body.append(input, item);
		input.focus();
		result.current.setItemRef(0, item);

		act(() => {
			result.current.moveActiveItem("ArrowDown");
		});

		expect(result.current.activeIndex).toBe(0);
		expect(document.activeElement).toBe(input);
		expect(item.scrollIntoView).toHaveBeenCalledWith({
			block: "nearest",
			inline: "nearest",
		});
		input.remove();
		item.remove();
	});

	test("skips disabled items for arrows and boundaries", () => {
		const { result } = renderHook(() =>
			useKeyboardListNavigation({
				itemCount: 3,
				isItemDisabled: (index) => index === 0 || index === 1,
			}),
		);
		const items = [0, 1, 2].map(() => {
			const element = document.createElement("button");
			element.scrollIntoView = vi.fn();
			return element;
		});
		items.forEach((element, index) => {
			result.current.setItemRef(index, element);
		});

		act(() => result.current.moveActiveItem("ArrowDown"));
		expect(result.current.activeIndex).toBe(2);
		act(() => result.current.focusBoundaryItem("Home"));
		expect(result.current.activeIndex).toBe(2);
	});

	test("matches explicit item text with buffered typeahead", () => {
		const labels = ["Alpha", "Beta", "Bravo"];
		const { result } = renderHook(() =>
			useKeyboardListNavigation({
				itemCount: labels.length,
				getItemTextValue: (index) => labels[index],
				typeahead: true,
			}),
		);
		const items = labels.map(() => {
			const element = document.createElement("button");
			element.scrollIntoView = vi.fn();
			return element;
		});
		items.forEach((element, index) => {
			result.current.setItemRef(index, element);
		});
		const event = {
			key: "b",
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: document.createElement("div"),
		} as unknown as React.KeyboardEvent<HTMLElement>;

		act(() => result.current.handleListKeyDown(event));
		expect(result.current.activeIndex).toBe(1);
		expect(event.preventDefault).toHaveBeenCalledOnce();
	});

	test("can stop at a collection boundary when looping is disabled", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 2, loop: false }));
		const first = document.createElement("button");
		const second = document.createElement("button");
		first.scrollIntoView = vi.fn();
		second.scrollIntoView = vi.fn();
		result.current.setItemRef(0, first);
		result.current.setItemRef(1, second);

		act(() => result.current.setActiveIndex(0));
		act(() => expect(result.current.moveActiveItem("ArrowUp")).toBe(false));
		expect(result.current.activeIndex).toBe(0);
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

		act(() => {
			result.current.setActiveIndex(1);
			result.current.handleListKeyDown(event);
		});
		expect(result.current.activeIndex).toBe(-1);
	});
	test("does not re-emit an unchanged active index", () => {
		const onActiveIndexChange = vi.fn();
		const { result } = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 1, onActiveIndexChange }),
		);
		act(() => result.current.setActiveIndex(-1));
		expect(onActiveIndexChange).not.toHaveBeenCalled();
	});

	test("returns false when an available check loses its target before activation", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 1 }));
		const item = document.createElement("button");
		item.scrollIntoView = vi.fn();
		result.current.setItemRef(0, item);
		result.current.setItemRef(0, null);
		expect(result.current.moveActiveItem("Home")).toBe(false);
	});

	test("wraps in both directions when looping and rejects unsupported movement keys", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 2 }));
		const items = [document.createElement("button"), document.createElement("button")];
		for (const [index, item] of items.entries()) {
			item.scrollIntoView = vi.fn();
			result.current.setItemRef(index, item);
		}
		act(() => result.current.setActiveIndex(1));
		act(() => expect(result.current.moveActiveItem("ArrowDown")).toBe(true));
		expect(result.current.activeIndex).toBe(0);
		act(() => expect(result.current.moveActiveItem("ArrowUp")).toBe(true));
		expect(result.current.activeIndex).toBe(1);
		expect(result.current.moveActiveItem("PageDown")).toBe(false);
	});

	test("clickActiveItem rejects a missing ref at the active index", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 2 }));
		act(() => result.current.setActiveIndex(1));
		expect(result.current.clickActiveItem()).toBe(false);
	});

	test("typeahead cycles repeated characters, clears its prior timer, and falls back to textContent", () => {
		vi.useFakeTimers();
		const { result, unmount } = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 3, typeahead: true, typeaheadTimeout: 50 }),
		);
		const labels = ["Alpha", "Alpine", "Beta"];
		const items = labels.map((label) => {
			const item = document.createElement("button");
			item.textContent = label;
			item.scrollIntoView = vi.fn();
			return item;
		});
		items.forEach((item, index) => {
			result.current.setItemRef(index, item);
		});

		act(() => expect(result.current.moveByTypeahead("a")).toBe(true));
		expect(result.current.activeIndex).toBe(0);
		act(() => expect(result.current.moveByTypeahead("a")).toBe(true));
		expect(result.current.activeIndex).toBe(1);
		act(() => vi.advanceTimersByTime(50));
		act(() => expect(result.current.moveByTypeahead("z")).toBe(false));

		unmount();
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	test("typeahead ignores disabled/missing items and is inert when disabled or empty", () => {
		const disabled = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 1, typeahead: false }),
		);
		expect(disabled.result.current.moveByTypeahead("a")).toBe(false);

		const empty = renderHook(() => useKeyboardListNavigation({ itemCount: 0, typeahead: true }));
		expect(empty.result.current.moveByTypeahead("a")).toBe(false);

		const { result } = renderHook(() =>
			useKeyboardListNavigation({
				itemCount: 2,
				typeahead: true,
				isItemDisabled: (index) => index === 0,
				getItemTextValue: () => "Alpha",
			}),
		);
		const first = document.createElement("button");
		const second = document.createElement("button");
		first.scrollIntoView = vi.fn();
		second.scrollIntoView = vi.fn();
		result.current.setItemRef(0, first);
		result.current.setItemRef(1, second);
		let moved = false;
		act(() => {
			moved = result.current.moveByTypeahead("a");
		});
		expect(moved).toBe(true);
		expect(result.current.activeIndex).toBe(1);
	});

	test("printable modifier keys do not trigger typeahead and Escape clears its buffer", () => {
		const { result } = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 1, typeahead: true }),
		);
		const item = document.createElement("button");
		item.textContent = "Alpha";
		item.scrollIntoView = vi.fn();
		result.current.setItemRef(0, item);

		const modified = {
			key: "a",
			altKey: true,
			ctrlKey: false,
			metaKey: false,
			defaultPrevented: false,
			preventDefault: vi.fn(),
			target: document.createElement("div"),
		} as unknown as React.KeyboardEvent<HTMLElement>;
		act(() => result.current.handleListKeyDown(modified));
		expect(modified.preventDefault).not.toHaveBeenCalled();

		act(() => result.current.moveByTypeahead("a"));
		const escapeEvent = { ...modified, key: "Escape", altKey: false, preventDefault: vi.fn() };
		act(() => result.current.handleListKeyDown(escapeEvent));
		expect(result.current.activeIndex).toBe(-1);
	});

	test("shrinking to the existing active index does not emit a redundant change", () => {
		const onActiveIndexChange = vi.fn();
		const { result, rerender } = renderHook(
			({ itemCount }) => useKeyboardListNavigation({ itemCount, onActiveIndexChange }),
			{ initialProps: { itemCount: 2 } },
		);
		act(() => result.current.setActiveIndex(0));
		onActiveIndexChange.mockClear();
		rerender({ itemCount: 1 });
		expect(onActiveIndexChange).not.toHaveBeenCalled();
	});
	test("focusBoundaryItem can focus the last registered item directly", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 2 }));
		const first = document.createElement("button");
		const last = document.createElement("button");
		first.scrollIntoView = vi.fn();
		last.scrollIntoView = vi.fn();
		last.focus = vi.fn();
		result.current.setItemRef(0, first);
		result.current.setItemRef(1, last);
		act(() => expect(result.current.focusBoundaryItem("End")).toBe(true));
		expect(result.current.activeIndex).toBe(1);
		expect(last.focus).toHaveBeenCalledOnce();
	});
});

test("virtual navigation reaches unmounted enabled boundaries and typeahead without activating absent DOM", () => {
	const { result } = renderHook(() =>
		useKeyboardListNavigation({
			itemCount: 200,
			focusOnMove: false,
			allowUnmountedItems: true,
			isItemDisabled: (index) => index === 199,
			typeahead: true,
			getItemTextValue: (index) => (index === 170 ? "Zebra" : `Item ${index}`),
		}),
	);
	act(() => {
		expect(result.current.moveActiveItem("End")).toBe(true);
	});
	expect(result.current.activeIndex).toBe(198);
	act(() => {
		expect(result.current.moveByTypeahead("z")).toBe(true);
	});
	expect(result.current.activeIndex).toBe(170);
	expect(result.current.clickActiveItem()).toBe(false);
});
test("missing refs remain unavailable by default and when focusOnMove is enabled", () => {
	const { result } = renderHook(() =>
		useKeyboardListNavigation({ itemCount: 200, allowUnmountedItems: true }),
	);
	act(() => {
		expect(result.current.moveActiveItem("End")).toBe(false);
	});
	expect(result.current.activeIndex).toBe(-1);
});

describe("pointer ownership", () => {
	const move = (
		props: ReturnType<ReturnType<typeof useKeyboardListNavigation>["getItemPointerProps"]>,
		x: number,
		y = 0,
		pointerType = "mouse",
	) =>
		props.onPointerMove({
			clientX: x,
			clientY: y,
			pointerType,
		} as unknown as React.PointerEvent<Element>);
	const leave = (
		props: ReturnType<ReturnType<typeof useKeyboardListNavigation>["getItemPointerProps"]>,
		relatedTarget: EventTarget | null = null,
	) => props.onPointerLeave({ relatedTarget } as unknown as React.PointerEvent<Element>);

	test("activates only on real pointer movement and ignores resting or touch pointers", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));
		const item = result.current.getItemPointerProps(1);

		act(() => move(item, 10, 10, "touch"));
		expect(result.current.activeIndex).toBe(-1);

		act(() => move(item, 10, 10));
		expect(result.current.activeIndex).toBe(1);

		// Content scrolled under a resting pointer: the same coordinates must not take over.
		act(() => result.current.setActiveIndex(0));
		act(() => move(result.current.getItemPointerProps(2), 10, 10));
		expect(result.current.activeIndex).toBe(0);

		act(() => move(result.current.getItemPointerProps(2), 11, 10));
		expect(result.current.activeIndex).toBe(2);
	});

	test("ignores disabled items", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));
		act(() => move(result.current.getItemPointerProps(1, { disabled: true }), 5));
		expect(result.current.activeIndex).toBe(-1);
	});

	test("keeps the active item when the pointer moves over that same item", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 2 }));
		act(() => result.current.setActiveIndex(1));
		act(() => move(result.current.getItemPointerProps(1), 5));
		expect(result.current.activeIndex).toBe(1);
	});

	test("releases a pointer-owned active item back to the previous selection on leave", () => {
		const { result } = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 3, focusOnMove: false }),
		);
		act(() => result.current.setActiveIndex(0));

		act(() => move(result.current.getItemPointerProps(2), 5));
		expect(result.current.activeIndex).toBe(2);

		act(() => leave(result.current.getItemPointerProps(2)));
		expect(result.current.activeIndex).toBe(0);
	});

	test("releases to no selection when nothing was active before hover", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));
		act(() => move(result.current.getItemPointerProps(1), 5));
		act(() => leave(result.current.getItemPointerProps(1)));
		expect(result.current.activeIndex).toBe(-1);
	});

	test("releases to no selection when the previous selection disappears", () => {
		const { result, rerender } = renderHook(
			({ itemCount }) => useKeyboardListNavigation({ itemCount, focusOnMove: false }),
			{ initialProps: { itemCount: 3 } },
		);
		act(() => result.current.setActiveIndex(2));
		act(() => move(result.current.getItemPointerProps(1), 5));
		rerender({ itemCount: 2 });
		act(() => leave(result.current.getItemPointerProps(1)));
		expect(result.current.activeIndex).toBe(-1);
	});

	test("keeps the active item while the pointer moves between items", () => {
		const { result } = renderHook(() => useKeyboardListNavigation({ itemCount: 3 }));
		const next = document.createElement("div");
		result.current.setItemRef(2, next);
		act(() => move(result.current.getItemPointerProps(1), 5));
		act(() => leave(result.current.getItemPointerProps(1), next));
		expect(result.current.activeIndex).toBe(1);
		act(() => move(result.current.getItemPointerProps(2), 6));
		expect(result.current.activeIndex).toBe(2);
	});

	test("keyboard and programmatic changes keep ownership across pointer leave", () => {
		const { result } = renderHook(() =>
			useKeyboardListNavigation({ itemCount: 3, focusOnMove: false }),
		);
		const items = [0, 1, 2].map(() => {
			const element = document.createElement("div");
			element.scrollIntoView = vi.fn();
			return element;
		});
		for (const [index, element] of items.entries()) {
			result.current.setItemRef(index, element);
		}
		act(() => result.current.setActiveIndex(0));
		act(() => move(result.current.getItemPointerProps(1), 5));

		act(() => {
			result.current.moveActiveItem("ArrowDown");
		});
		expect(result.current.activeIndex).toBe(2);
		act(() => leave(result.current.getItemPointerProps(2)));
		expect(result.current.activeIndex).toBe(2);

		act(() => move(result.current.getItemPointerProps(1), 9));
		act(() => result.current.setActiveIndex(0));
		act(() => leave(result.current.getItemPointerProps(0)));
		expect(result.current.activeIndex).toBe(0);
	});
});
