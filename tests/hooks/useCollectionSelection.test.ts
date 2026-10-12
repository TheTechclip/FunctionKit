import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useCollectionSelection } from "@/web/packages/hooks/useCollectionSelection";

describe("useCollectionSelection", () => {
	test("single replace selection does not clear an already selected key without toggle intent", () => {
		const onSelectionChange = vi.fn();
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a"],
				selectionMode: "single",
				selectionBehavior: "replace",
				defaultSelectedKeys: ["a"],
				onSelectionChange,
			}),
		);
		act(() => expect(result.current.select("a")).toBe(false));
		expect([...result.current.selectedKeys]).toEqual(["a"]);
		expect(onSelectionChange).not.toHaveBeenCalled();
	});
	test.each(["single", "multiple"] as const)(
		"missing select/replace keys preserve %s selection even with empty-selection prevention",
		(selectionMode) => {
			const onSelectionChange = vi.fn();
			const { result } = renderHook(() =>
				useCollectionSelection<string>({
					keys: ["a", "b"],
					selectionMode,
					selectionBehavior: "replace",
					defaultSelectedKeys: ["a"],
					disallowEmptySelection: true,
					onSelectionChange,
				}),
			);
			act(() => {
				expect(result.current.select("missing")).toBe(false);
				expect(result.current.replace("missing")).toBe(false);
			});
			expect([...result.current.selectedKeys]).toEqual(["a"]);
			expect(onSelectionChange).not.toHaveBeenCalled();
		},
	);

	test("rejected operations preserve the range anchor and valid final selection", () => {
		const onSelectionChange = vi.fn();
		const { result } = renderHook(() =>
			useCollectionSelection<string>({
				keys: ["a", "b", "c", "d"],
				selectionMode: "multiple",
				selectionBehavior: "replace",
				disabledKeys: ["b"],
				onSelectionChange,
			}),
		);
		act(() => expect(result.current.replace("a")).toBe(true));
		act(() => {
			expect(result.current.select("missing", { extend: true })).toBe(false);
			expect(result.current.select("missing")).toBe(false);
			expect(result.current.replace("missing")).toBe(false);
			expect(result.current.select("b")).toBe(false);
			expect(result.current.replace("b")).toBe(false);
		});
		expect([...result.current.selectedKeys]).toEqual(["a"]);
		expect(onSelectionChange).toHaveBeenCalledOnce();
		act(() => expect(result.current.select("d", { extend: true })).toBe(true));
		expect([...result.current.selectedKeys]).toEqual(["a", "c", "d"]);
		expect(onSelectionChange).toHaveBeenCalledTimes(2);
	});

	test("controlled missing keys are rejected without emitting an empty replacement", () => {
		const onSelectionChange = vi.fn();
		const { result } = renderHook(() =>
			useCollectionSelection<string>({
				keys: ["a", "b"],
				selectedKeys: ["a"],
				selectionMode: "single",
				onSelectionChange,
			}),
		);
		expect(result.current.select("missing")).toBe(false);
		expect(result.current.replace("missing")).toBe(false);
		expect([...result.current.selectedKeys]).toEqual(["a"]);
		expect(onSelectionChange).not.toHaveBeenCalled();
	});

	test("supports uncontrolled multiple toggle selection", () => {
		const { result } = renderHook(() =>
			useCollectionSelection({ keys: ["a", "b"], selectionMode: "multiple" }),
		);

		act(() => result.current.select("a"));
		expect([...result.current.selectedKeys]).toEqual(["a"]);
		act(() => result.current.select("b"));
		expect([...result.current.selectedKeys]).toEqual(["a", "b"]);
		act(() => result.current.select("a"));
		expect([...result.current.selectedKeys]).toEqual(["b"]);
	});

	test("keeps controlled selection external and emits the next set", () => {
		const onSelectionChange = vi.fn();
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a", "b"],
				selectionMode: "multiple",
				selectedKeys: ["a"],
				onSelectionChange,
			}),
		);

		act(() => result.current.select("b"));
		expect([...result.current.selectedKeys]).toEqual(["a"]);
		expect([...onSelectionChange.mock.calls[0][0]]).toEqual(["a", "b"]);
	});

	test("supports replace behavior and explicit modifier toggles", () => {
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a", "b"],
				selectionMode: "multiple",
				selectionBehavior: "replace",
				defaultSelectedKeys: ["a"],
			}),
		);

		act(() => result.current.select("b"));
		expect([...result.current.selectedKeys]).toEqual(["b"]);
		act(() => result.current.select("a", { toggle: true }));
		expect([...result.current.selectedKeys]).toEqual(["b", "a"]);
	});

	test("selects ranges in collection order while skipping disabled keys", () => {
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a", "b", "c", "d"],
				selectionMode: "multiple",
				disabledKeys: ["c"],
			}),
		);

		act(() => result.current.select("a"));
		act(() => result.current.select("d", { extend: true }));
		expect([...result.current.selectedKeys]).toEqual(["a", "b", "d"]);
	});

	test("normalizes single selection and can disallow clearing it", () => {
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a", "b"],
				selectionMode: "single",
				defaultSelectedKeys: ["a", "b"],
				disallowEmptySelection: true,
			}),
		);

		expect([...result.current.selectedKeys]).toEqual(["a"]);
		act(() => result.current.select("a"));
		expect([...result.current.selectedKeys]).toEqual(["a"]);
		expect(result.current.clear()).toBe(false);
	});

	test("selects all enabled keys and ignores selection in none mode", () => {
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a", "b", "c"],
				selectionMode: "multiple",
				disabledKeys: ["b"],
			}),
		);
		act(() => result.current.selectAll());
		expect([...result.current.selectedKeys]).toEqual(["a", "c"]);

		const none = renderHook(() => useCollectionSelection({ keys: ["a"], selectionMode: "none" }));
		expect(none.result.current.select("a")).toBe(false);
	});

	test("drops selections that disappear from an uncontrolled collection", () => {
		const { result, rerender } = renderHook(
			({ keys }) =>
				useCollectionSelection({
					keys,
					selectionMode: "multiple",
					defaultSelectedKeys: ["a", "b"],
				}),
			{ initialProps: { keys: ["a", "b"] } },
		);

		expect([...result.current.selectedKeys]).toEqual(["a", "b"]);
		rerender({ keys: ["b"] });
		expect([...result.current.selectedKeys]).toEqual(["b"]);
	});
	test("exposes selected/disabled predicates and ignores disabled replacement", () => {
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a", "b"],
				selectionMode: "multiple",
				defaultSelectedKeys: ["a"],
				disabledKeys: ["b"],
			}),
		);
		expect(result.current.isSelected("a")).toBe(true);
		expect(result.current.isDisabled("b")).toBe(true);
		expect(result.current.replace("b")).toBe(false);
		expect([...result.current.selectedKeys]).toEqual(["a"]);
	});

	test("supports explicit replace and clear operations", () => {
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a", "b"],
				selectionMode: "multiple",
				defaultSelectedKeys: ["a"],
			}),
		);
		act(() => expect(result.current.replace("b")).toBe(true));
		expect([...result.current.selectedKeys]).toEqual(["b"]);
		act(() => expect(result.current.clear()).toBe(true));
		expect([...result.current.selectedKeys]).toEqual([]);
		expect(result.current.clear()).toBe(false);
	});

	test("single toggle can clear unless empty selection is disallowed", () => {
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a"],
				selectionMode: "single",
				defaultSelectedKeys: ["a"],
			}),
		);
		act(() => expect(result.current.select("a")).toBe(true));
		expect([...result.current.selectedKeys]).toEqual([]);

		act(() => expect(result.current.select("a")).toBe(true));
		expect([...result.current.selectedKeys]).toEqual(["a"]);
		act(() => expect(result.current.select("a", { toggle: true })).toBe(true));
		expect([...result.current.selectedKeys]).toEqual([]);
	});

	test("range selection can preserve current values and handles a stale anchor", () => {
		const { result, rerender } = renderHook(
			({ keys }) =>
				useCollectionSelection({ keys, selectionMode: "multiple", defaultSelectedKeys: ["d"] }),
			{ initialProps: { keys: ["a", "b", "c", "d"] } },
		);
		act(() => result.current.select("b"));
		act(() => result.current.select("d", { extend: true, toggle: true }));
		expect([...result.current.selectedKeys]).toEqual(["d", "b", "c"]);

		act(() => result.current.select("a"));
		rerender({ keys: ["b", "c", "d"] });
		act(() => result.current.select("d", { extend: true }));
		expect([...result.current.selectedKeys]).toEqual(["b", "c"]);
	});

	test("rejects operations that are invalid for the current mode", () => {
		const none = renderHook(() => useCollectionSelection({ keys: ["a"], selectionMode: "none" }));
		expect(none.result.current.replace("a")).toBe(false);
		expect(none.result.current.clear()).toBe(false);
		expect(none.result.current.selectAll()).toBe(false);

		const single = renderHook(() =>
			useCollectionSelection({ keys: ["a"], selectionMode: "single" }),
		);
		expect(single.result.current.selectAll()).toBe(false);
	});

	test("normalizes invalid and disabled defaults and avoids duplicate change notifications", () => {
		const onSelectionChange = vi.fn();
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a", "b"],
				selectionMode: "multiple",
				defaultSelectedKeys: ["missing", "b"],
				disabledKeys: ["b"],
				onSelectionChange,
			}),
		);
		expect([...result.current.selectedKeys]).toEqual([]);
		act(() => expect(result.current.clear()).toBe(false));
		expect(onSelectionChange).not.toHaveBeenCalled();
	});

	test("controlled collections do not renormalize through the uncontrolled effect", () => {
		const { result, rerender } = renderHook(
			({ keys, selectedKeys }) =>
				useCollectionSelection({ keys, selectedKeys, selectionMode: "multiple" }),
			{ initialProps: { keys: ["a", "b"], selectedKeys: ["a"] } },
		);
		expect([...result.current.selectedKeys]).toEqual(["a"]);
		rerender({ keys: ["b"], selectedKeys: ["a"] });
		expect([...result.current.selectedKeys]).toEqual([]);
	});
	test("disallowEmptySelection still permits removing one item from a multi-selection", () => {
		const { result } = renderHook(() =>
			useCollectionSelection({
				keys: ["a", "b"],
				selectionMode: "multiple",
				defaultSelectedKeys: ["a", "b"],
				disallowEmptySelection: true,
			}),
		);
		act(() => expect(result.current.select("a")).toBe(true));
		expect([...result.current.selectedKeys]).toEqual(["b"]);
		expect(result.current.select("b")).toBe(false);
		expect([...result.current.selectedKeys]).toEqual(["b"]);
	});
});
