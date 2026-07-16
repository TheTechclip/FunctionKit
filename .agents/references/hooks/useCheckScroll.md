# useCheckScroll

## Purpose

Detects whether the page has been scrolled vertically (`window.scrollY > 0`). Returns an `isScrolled` flag for toggling UI states such as sticky header shadows or floating action buttons.

## Usage Logic

Listens to the `scroll` event on `window`. Memoizes the check to avoid unnecessary re-renders.

## Type Signature

```ts
function useCheckScroll(): { isScrolled: boolean }
```

Returns `{ isScrolled: boolean }` — `isScrolled` is `true` when `window.scrollY > 0`.

## Example Code

```tsx
import { useCheckScroll } from "@musecat/functionkit/hooks/useCheckScroll";

function StickyHeader() {
  const { isScrolled } = useCheckScroll();
  return (
    <header className={isScrolled ? "header--scrolled" : "header--top"}>
      ...
    </header>
  );
}
```

## Note

Not exported from the barrel. Import via subpath only: `@musecat/functionkit/hooks/useCheckScroll`.
