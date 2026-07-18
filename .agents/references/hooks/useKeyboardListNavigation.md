# useKeyboardListNavigation

## Purpose

Adds keyboard-based navigation (ArrowUp, ArrowDown, Home, End, Enter) to a list of items. Returns the active index, ref registration, imperative focus/click helpers, and a keydown handler.

## Usage Logic

Manages an `activeIndex` state updated by arrow keys. `Home`/`End` jump to the first/last registered item. `Enter` and Space click the active registered item. It skips editable targets and can constrain handling to a supplied container. When the list shrinks, an out-of-range active index is clamped; an empty list resets it to `-1`.

## Type Signature

```ts
function useKeyboardListNavigation(options: {
  itemCount: number;
}): {
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  setItemRef: (index: number, element: HTMLElement | null) => void;
  clickActiveItem: () => boolean;
  focusBoundaryItem: (key: string) => boolean;
  moveActiveItem: (key: string) => boolean;
  handleListKeyDown: (
    event: React.KeyboardEvent<HTMLElement>,
    options?: { container?: HTMLElement | null },
  ) => void;
};
```

## Example Code

```tsx
import { useKeyboardListNavigation } from "@musecat/functionkit";

function MenuList({ items }: { items: string[] }) {
  const { activeIndex, setItemRef, handleListKeyDown } = useKeyboardListNavigation({
    itemCount: items.length,
  });

  return (
    <ul onKeyDown={handleListKeyDown}>
      {items.map((item, i) => (
        <li
          key={i}
          ref={(element) => setItemRef(i, element)}
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
