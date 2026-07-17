# useTimeout

## Purpose

A `setTimeout` wrapper hook that provides imperative controls: `start`, `reset`, `clear`, and an `isPending` state. Allows conditionally enabling the timeout.

## Usage Logic

Creates a timer on mount (unless `enabled: false`). The returned `start` begins the timeout, `clear` cancels it, and `reset` restarts it. `isPending` reflects whether a timeout is currently active.

## Type Signatures

```ts
interface UseTimeoutControls {
  start: () => void;
  reset: () => void;
  clear: () => void;
  isPending: boolean;
}

function useTimeout(
  callback: () => void,
  delay: number,
  options?: { enabled?: boolean }
): UseTimeoutControls;
```

## Example Code

```tsx
import { useTimeout } from "@musecat/functionkit";

function AutoDismiss({ onDismiss }: { onDismiss: () => void }) {
  const { reset, isPending } = useTimeout(onDismiss, 5000);

  return (
    <div onMouseEnter={reset}>
      Dismissing in {isPending ? "..." : "done"}
    </div>
  );
}
```
