# useCheckInvisible

## Purpose

Detects whether an element with a given CSS class name has scrolled above the viewport (`top < 0`). Useful for triggering "sticky" or "collapsed" states when a section scrolls out of view.

## Usage Logic

Registers a window scroll listener and checks the first element matching the provided class name. `isInvisible` is `true` when the element's top edge is above the viewport.

## Type Signature

```ts
function useCheckInvisible(className: string): { isInvisible: boolean }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `className` | `string` | CSS class name of the element to monitor |

Returns `{ isInvisible: boolean }` — `isInvisible` is `true` when the element is scrolled out of view (top < 0).

## Example Code

```tsx
"use client";

import { useCheckInvisible } from "@musecat/functionkit";

function Header() {
	const { isInvisible } = useCheckInvisible("hero-section");
	return <header className={isInvisible ? "sticky" : ""}>...</header>;
}
```

## Import and SSR boundary

Exported from the root barrel. Client-only (`"use client"`): call it only from a Client Component.
