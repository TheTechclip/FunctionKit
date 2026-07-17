# useCheckInvisible

## Purpose

Detects whether an element with a given CSS class name has scrolled above the viewport (`top < 0`). Useful for triggering "sticky" or "collapsed" states when a section scrolls out of view.

## Usage Logic

Uses `IntersectionObserver` or scroll event tracking to monitor the first element matching the provided class name. Returns `true` when the element's top edge is above the viewport.

## Type Signature

```ts
function useCheckInvisible(className: string): boolean
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `className` | `string` | CSS class name of the element to monitor |

Returns `boolean` — `true` when the element is scrolled out of view (top < 0).

## Example Code

```tsx
import { useCheckInvisible } from "@musecat/functionkit/hooks/useCheckInvisible";

function Header() {
  const isHidden = useCheckInvisible("hero-section");
  return <header className={isHidden ? "sticky" : ""}>...</header>;
}
```

## Note

Not exported from the barrel. Import via subpath only: `@musecat/functionkit/hooks/useCheckInvisible`.
