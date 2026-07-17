# useDebounce / debounce

## Purpose

Delays the propagation of a rapidly changing value. Includes both a raw utility function (`debounce`) for non-React use and a React hook (`useDebounce`) that auto-cleans up on unmount.

## Usage Logic

**`debounce`**: A pure function that wraps any callback with configurable leading/trailing edge execution. Returns the debounced function with a `.cancel()` method.

**`useDebounce`**: React hook that returns the debounced value. Internally uses `useState` + `useEffect` with the raw `debounce` utility. Automatically cancels pending timers on unmount.

## Type Signatures

```ts
// Pure function — SSR-safe
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options?: { leading?: boolean; trailing?: boolean }
): T & { cancel: () => void };

// React hook — client-only
function useDebounce<T>(
  value: T,
  delay: number,
  options?: { leading?: boolean; trailing?: boolean }
): T;
```

## Example Code

```tsx
import { useDebounce } from "@musecat/functionkit";

function SearchInput() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery);
  }, [debouncedQuery]);

  return <input onChange={(e) => setQuery(e.target.value)} />;
}
```
