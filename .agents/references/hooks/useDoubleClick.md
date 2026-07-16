# useDoubleClick

## Purpose

Distinguishes between a single click and a double click on the same element. Fires `click` on a single click after a configurable delay, or `doubleClick` if a second click arrives within the delay window.

## Usage Logic

Maintains an internal timer. On the first click it waits for `delay` ms. If a second click arrives within that window, it fires `doubleClick` and clears the timer. Otherwise it fires `click` after the delay expires.

## Type Signature

```ts
function useDoubleClick(
  handlers: {
    click?: () => void;
    doubleClick?: () => void;
  },
  delay?: number
): {
  onClick: () => void;
};
```

Returns an `onClick` handler to spread onto the target element.

## Example Code

```tsx
import { useDoubleClick } from "@musecat/functionkit";

function FileIcon() {
  const { onClick } = useDoubleClick({
    click: () => console.log("select"),
    doubleClick: () => console.log("open"),
  });

  return <div onClick={onClick}>📄</div>;
}
```
