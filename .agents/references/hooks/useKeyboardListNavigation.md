# useKeyboardListNavigation

## Purpose

Adds keyboard-based navigation (ArrowUp, ArrowDown, Home, End, Enter) to a list of items. Returns the active index, a ref setter, and a keydown handler.

## Usage Logic

Manages an `activeIndex` state updated by arrow keys. `Home`/`End` jump to the first/last item. `Enter` triggers the `onSelect` callback with the active index. Automatically skips navigation when the event target is an editable element (`isEditableKeyboardTarget`).

| Option | Effect |
|--------|--------|
| `loop` | When `true`, navigating past the last item wraps to the first |
| `disable` | When `true`, all keyboard handling is suspended |

## Type Signature

```ts
function useKeyboardListNavigation(options: {
  itemCount: number;
  onSelect: (index: number) => void;
  disable?: boolean;
  loop?: boolean;
}): {
  activeIndex: number;
  setItemRef: (index: number) => (el: HTMLElement | null) => void;
  handleListKeyDown: (e: React.KeyboardEvent) => void;
};
```

## Example Code

```tsx
import { useKeyboardListNavigation } from "@musecat/functionkit";

function MenuList({ items }: { items: string[] }) {
  const { activeIndex, setItemRef, handleListKeyDown } = useKeyboardListNavigation({
    itemCount: items.length,
    onSelect: (i) => console.log("selected:", items[i]),
    loop: true,
  });

  return (
    <ul onKeyDown={handleListKeyDown}>
      {items.map((item, i) => (
        <li
          key={i}
          ref={setItemRef(i)}
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
