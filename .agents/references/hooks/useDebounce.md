# useDebounce / debounce

## Purpose

Delays callback invocation. Includes an SSR-safe raw utility (`debounce`) and a React hook (`useDebounce`) that cancels work on unmount.

## Usage Logic

**`debounce`**: A pure function that wraps any callback with configurable leading/trailing edge execution. Returns the debounced function with a `.cancel()` method.

**`useDebounce`**: React hook that returns a stable debounced callback. It calls the latest callback after the configured delay and cancels pending timers on unmount.

## Type Signatures

```ts
// Pure function — SSR-safe
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options?: { leading?: boolean; trailing?: boolean }
): T & { cancel: () => void };

// React hook — client-only
function useDebounce<F extends (...args: never[]) => unknown>(
  callback: F,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): F & { cancel(): void };
```

## Example Code

```tsx
import { useDebounce } from "@musecat/functionkit";

function SearchInput() {
  const handleSearch = useDebounce(fetchResults, 300);
  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```
