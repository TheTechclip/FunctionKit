# usePreservedCallback

## Purpose

Returns a stable function identity while always calling the latest version of the provided callback. Eliminates the need to list callback dependencies in `useEffect` or `useMemo` dependency arrays.

## Usage Logic

Stores the latest callback in a `useRef`, then returns a `useCallback`-wrapped proxy that always invokes `ref.current`. The returned function never changes identity, preventing unnecessary re-renders of memoized children.

## Type Signature

```ts
function usePreservedCallback<T extends (...args: any[]) => any>(
  callback: T
): T;
```

## Example Code

```tsx
import { usePreservedCallback, useIntersectionObserver } from "@musecat/functionkit";

function InfiniteScroll({ onLoadMore }: { onLoadMore: () => void }) {
  const stableLoadMore = usePreservedCallback(onLoadMore);

  const ref = useIntersectionObserver(([entry]) => {
    if (entry.isIntersecting) stableLoadMore();
  });

  return <div ref={ref}>...</div>;
}
```
