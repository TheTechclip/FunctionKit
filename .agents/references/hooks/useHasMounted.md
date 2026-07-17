# useHasMounted

## Purpose

Returns a boolean indicating whether the component has mounted on the client. A simple hydration guard for preventing server-client content mismatches.

## Usage Logic

Uses `useEffect` to set `true` after mount. Returns `false` on the server and during the first client render before hydration.

## Type Signature

```ts
function useHasMounted(): boolean;
```

## Example Code

```tsx
import { useHasMounted } from "@musecat/functionkit";

function ClientOnly() {
  const mounted = useHasMounted();
  if (!mounted) return <Fallback />;
  return <ClientContent />;
}
```
