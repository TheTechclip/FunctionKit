# isEditableKeyboardTarget

## Purpose

Checks if a keyboard event target is an editable element (`input`, `textarea`, `select`, or `contentEditable`). Used to prevent keyboard navigation hooks from interfering with native input editing.

## Usage Logic

Examines the target element's tag name and `isContentEditable` property. Excludes buttons, checkboxes, and radio inputs from the editable set.

## Type Signature

```ts
function isEditableKeyboardTarget(target: EventTarget | null): boolean;
```

## Example Code

```tsx
import { isEditableKeyboardTarget, useKeyboardListNavigation } from "@musecat/functionkit";

function SearchableList({ items }: { items: string[] }) {
  const { handleListKeyDown } = useKeyboardListNavigation({
    itemCount: items.length,
    onSelect: (i) => console.log(items[i]),
  });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (isEditableKeyboardTarget(e.target)) return; // Don't steal from inputs
    handleListKeyDown(e);
  };

  return <ul onKeyDown={onKeyDown}>...</ul>;
}
```
