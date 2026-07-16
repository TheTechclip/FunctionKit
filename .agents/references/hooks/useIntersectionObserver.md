# useIntersectionObserver

## Purpose

Provides a convenient ref callback pattern for `IntersectionObserver`. Calls a callback when the observed element's intersection status changes.

## Usage Logic

Uses `useRefEffect` internally to attach the observer when the ref receives an element and clean up when it unmounts. Accepts standard `IntersectionObserverInit` options. The callback is stabilized with `usePreservedCallback`.

## Type Signature

```ts
function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): (node: HTMLElement | null) => void;
```

Returns a callback ref to assign to the target element.

## Example Code

```tsx
import { useIntersectionObserver } from "@musecat/functionkit";

function LazyImage() {
  const ref = useIntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) loadImage();
    },
    { threshold: 0.1 }
  );

  return <div ref={ref}>...</div>;
}
```
