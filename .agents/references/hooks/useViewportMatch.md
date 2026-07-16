# useViewportMatch

## Purpose

Returns whether the current viewport matches a CSS media query string. Reactive — updates when the match status changes (e.g., window resize).

## Usage Logic

Uses `window.matchMedia` to create a `MediaQueryList`, then subscribes to its `change` event to track live changes.

## Type Signature

```ts
function useViewportMatch(query: string): boolean;
```

| Parameter | Type | Example |
|-----------|------|---------|
| `query` | `string` | `"(min-width: 768px)"`, `"(prefers-color-scheme: dark)"` |

## Example Code

```tsx
import { useViewportMatch } from "@musecat/functionkit";

function ResponsiveComponent() {
  const isDesktop = useViewportMatch("(min-width: 1024px)");
  const isDark = useViewportMatch("(prefers-color-scheme: dark)");

  return <div className={isDesktop ? "desktop" : "mobile"}>...</div>;
}
```
