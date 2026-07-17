# ScrolltoTop

## Purpose

Scrolls the window to the top (`0, 0`) when the component mounts. Typically placed at the top of a page layout to reset scroll position on navigation.

## Usage Logic

Calls `window.scrollTo(0, 0)` inside a `useEffect` with empty dependencies. No state, no props.

## Type Signature

```ts
function ScrolltoTop(): null;
```

Renders nothing — returns `null`.

## Example Code

```tsx
import { ScrolltoTop } from "@musecat/functionkit";

export default function Page() {
  return (
    <>
      <ScrolltoTop />
      <PageContent />
    </>
  );
}
```

## Note

Not exported from the barrel. Import via component subpath. Client-only (`"use client"`).
