# useCollectionSelection

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`packages/hooks/useCollectionSelection.ts`](../../web/packages/hooks/useCollectionSelection.ts)
**Root export:** [`public.ts`](../../web/public.ts)
**Tests:** [`tests/hooks/useCollectionSelection.test.ts`](../../tests/hooks/useCollectionSelection.test.ts)

## 목적과 소유권

`useCollectionSelection` owns product-neutral key selection for ordered collections. It supports controlled and uncontrolled state without rendering UI or assigning ARIA roles. UIKit collection components own presentation and translate pointer or keyboard events into selection intents.

## Public API

The hook accepts ordered `keys`, `none | single | multiple` selection mode, `toggle | replace` behavior, controlled `selectedKeys` or uncontrolled `defaultSelectedKeys`, disabled keys, optional empty-selection prevention, and `onSelectionChange`.

It returns the current readonly key set, `isSelected`, `isDisabled`, intent-aware `select`, explicit `replace`, `clear`, and `selectAll`. `select(key, { extend: true })` selects the enabled range from the previous anchor. `{ toggle: true }` preserves the current set while adding a range or toggling one key.

## 동작 계약

- Controlled mode never mutates local selection; callbacks receive a fresh normalized `Set`.
- Disabled or missing keys are removed from emitted selection.
- `select` and `replace` reject missing or disabled keys with `false` before changing selection or the range anchor, and emit no notification. This applies even when empty selection is allowed.
- Single mode retains at most one key.
- `disallowEmptySelection` prevents clearing the final selected key.
- Range selection follows the supplied `keys` order and skips disabled keys.
- An accepted range endpoint is always in `keys`; only the previous anchor can become stale when the collection changes.

## 접근성

해당 없음. This hook renders no elements; the consuming collection owns roles, focus, keyboard bindings, and accessible labels.

## 오류와 cleanup

For example, with `keys: ["a", "b", "c"]`, call `replace("a")`, then `select("missing")` or `replace("missing")`: the invalid operation returns `false`, keeps `"a"` selected, and does not call `onSelectionChange`. A subsequent `select("c", { extend: true })` still selects the range from `"a"`. `disallowEmptySelection` does not turn missing keys into valid replacements. No global listeners or timers are created, so there is no resource cleanup.

## 예제

```tsx
import { useCollectionSelection } from "@musecat/functionkit/web";

const selection = useCollectionSelection({
  keys: files.map((file) => file.id),
  selectionMode: "multiple",
  selectedKeys,
  onSelectionChange: setSelectedKeys,
});

selection.select(file.id, {
  extend: event.shiftKey,
  toggle: event.metaKey || event.ctrlKey,
});
```

## 금지 패턴

Do not infer keys from array indices when stable domain keys exist. Do not place visual state or DOM event objects inside this hook.

## 검증

Contract tests cover controlled and uncontrolled selection, single and multiple modes, toggle and replace behavior, ranges, disabled keys, select-all, and empty-selection prevention.

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.
