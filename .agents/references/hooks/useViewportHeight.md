# useViewportHeight

## Purpose

Returns the current viewport height in pixels, reacting to resize events. Uses `visualViewport` when available, falling back to `window.innerHeight`.

## Usage Logic

Subscribes to `visualViewport.resize` (or `window.resize`) events and updates state accordingly. Debounces updates to avoid excessive re-renders during rapid resize.

## Type Signature

```ts
function useViewportHeight(): number;
```

## Example Code

```tsx
import { useViewportHeight } from "@musecat/functionkit";

function FullHeight() {
  const height = useViewportHeight();
  return <div style={{ height }}>Content</div>;
}
```
