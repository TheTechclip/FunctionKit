# ViewportPortal

## Purpose

Renders children into a fixed-position portal root (`#viewport-portal-root`) using `createPortal`. Designed for overlays, modals, toasts, and tooltips that need to escape parent overflow/stacking contexts.

## Usage Logic

On first render, ensures the portal root `<div>` exists in `document.body`. Then portals children into it. The portal root has `position: fixed`, `inset: 0`, `z-index: 9999`, and `pointer-events: none`. Children must set `pointer-events: auto` to be interactive.

## Type Signature

```ts
function ViewportPortal({ children }: { children: ReactNode }): ReactPortal;

// Utility to get the portal root element
function getViewportPortalRoot(): HTMLDivElement;
```

## Example Code

```tsx
import { ViewportPortal } from "@musecat/functionkit";

function ToastContainer() {
  return (
    <ViewportPortal>
      <div style={{ pointerEvents: "auto" }}>
        <Toast message="Saved!" />
      </div>
    </ViewportPortal>
  );
}
```
