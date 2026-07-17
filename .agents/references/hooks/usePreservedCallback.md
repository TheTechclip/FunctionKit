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

## Trade-off

`usePreservedCallback` uses `useRef` + `useEffect` to keep a stable callback reference that always calls the latest version. Because the ref is synced via `useEffect` (after paint), the returned callback may hold a **stale value** during the first render or in the gap between a re-render and the effect flush. In practice this is never an issue — the callback is only invoked in event handlers that fire post-paint. This is the same pattern used by react-hook-form, Radix UI, and others. If synchronous invocation during render is required, use a regular `useCallback` with inline deps instead.
