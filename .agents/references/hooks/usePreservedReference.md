# usePreservedReference

## Purpose

Maintains a stable reference to a value, only updating it when the value meaningfully changes. Avoids unnecessary re-renders caused by new object/array identities on every render.

## Usage Logic

Compares the current and previous values using a custom comparator (defaults to `JSON.stringify`). If they are considered equal, the previous reference is returned instead of the new one.

## Type Signature

```ts
function usePreservedReference<T>(
  value: T,
  compare?: (a: T, b: T) => boolean
): T;
```

## Example Code

```tsx
import { usePreservedReference } from "@musecat/functionkit";

function Filters({ filters }: { filters: { sort: string; page: number } }) {
  const stableFilters = usePreservedReference(filters);

  useEffect(() => {
    fetchResults(stableFilters);
  }, [stableFilters]); // Only fires when actual values change

  return <div>...</div>;
}
```
