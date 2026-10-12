# useKeyboardListNavigation

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useKeyboardListNavigation.ts`](../../web/packages/hooks/useKeyboardListNavigation.ts)
**Tests:** [`useKeyboardListNavigation.test.ts`](../../tests/hooks/useKeyboardListNavigation.test.ts)

## 목적과 소유권

Adds keyboard-based navigation (ArrowUp, ArrowDown, Home, End, Enter) to a list of items. Returns the active index, ref registration, imperative focus/click helpers, and a keydown handler.

## 동작 계약

Manages an `activeIndex` state updated by arrow keys. `Home`/`End` jump to the first/last registered enabled item. `Enter` and Space click the active registered item. It skips editable targets and can constrain handling to a supplied container. `isItemDisabled` excludes unavailable items from every navigation path. `getItemTextValue` plus `typeahead` enables buffered prefix matching, with registered element text as a fallback. `loop` controls boundary wrapping. Availability is decided once per synchronous activation; after an index passes the registered/enabled check the stored element is treated as present for that activation.

`activeIndex` with `onActiveIndexChange` enables controlled composition. Without `activeIndex`, the hook owns internal active state. The returned `setActiveIndex` retains the React state-dispatch contract in both modes.

`getItemPointerProps(index, { disabled })` returns `onPointerMove`/`onPointerLeave` for item hover. Spread it onto each item instead of calling `setActiveIndex` from `onMouseEnter`. Hover activates an item only on real mouse/pen movement; touch pointers, disabled items, and a pointer resting still while content scrolls or re-renders beneath it never move the active item (`mouseenter` fires in those cases, `pointermove` does not). A hover-owned active item reverts to the previous keyboard/programmatic selection (or `-1`) when the pointer leaves the list. Moving directly between registered items does not revert, and any keyboard or `setActiveIndex` change takes ownership from the pointer.

When `focusOnMove` is `false`, navigation updates the active descendant and scrolls it into view without moving DOM focus; this is useful for combobox inputs. When the list shrinks, an out-of-range active index is clamped; an empty list resets it to `-1`.

## Public API

```ts
function useKeyboardListNavigation(options: {
  itemCount: number;
  activeIndex?: number;
  focusOnMove?: boolean;
  getItemTextValue?: (index: number) => string | undefined;
  isItemDisabled?: (index: number) => boolean;
  loop?: boolean;
  onActiveIndexChange?: (index: number) => void;
  typeahead?: boolean;
  typeaheadTimeout?: number;
}): {
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  setItemRef: (index: number, element: HTMLElement | null) => void;
  getItemPointerProps: (
    index: number,
    options?: { disabled?: boolean },
  ) => {
    onPointerMove: (event: React.PointerEvent<Element>) => void;
    onPointerLeave: (event: React.PointerEvent<Element>) => void;
  };
  clickActiveItem: () => boolean;
  focusBoundaryItem: (key: string) => boolean;
  moveActiveItem: (key: string) => boolean;
  moveByTypeahead: (key: string) => boolean;
  handleListKeyDown: (
    event: React.KeyboardEvent<HTMLElement>,
    options?: { container?: HTMLElement | null },
  ) => void;
};
```

## 예제

```tsx
import { useKeyboardListNavigation } from "@musecat/functionkit/web";

function MenuList({ items }: { items: string[] }) {
  const { activeIndex, setItemRef, getItemPointerProps, handleListKeyDown } =
    useKeyboardListNavigation({
    itemCount: items.length,
    getItemTextValue: (index) => items[index],
    typeahead: true,
  });

  return (
    <ul onKeyDown={handleListKeyDown}>
      {items.map((item, i) => (
        <li
          key={i}
          ref={(element) => setItemRef(i, element)}
          {...getItemPointerProps(i)}
          className={i === activeIndex ? "active" : ""}
          tabIndex={-1}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

Client-only (`"use client"`).

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. 반환/handler가 focus movement를 다룬다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

Typeahead가 활성화되면 buffer reset timeout을 소유하며 unmount에서 pending timeout을 정리한다. Item ref availability는 동기 activation 동안 단일 invariant로 처리하고 중복 null 방어를 두지 않는다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useKeyboardListNavigation.test.ts`](../../tests/hooks/useKeyboardListNavigation.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.

For measured virtual lists, `allowUnmountedItems: true` with `focusOnMove: false` allows navigation and typeahead across unmounted enabled items. Supply `getItemTextValue` for all items. The renderer must mount the active index and own its scrolling/focus. The default still skips missing refs. `clickActiveItem` succeeds only for a mounted item.
