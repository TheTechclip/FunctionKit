# useInterval

## Purpose

A `setInterval` wrapper hook that handles lifecycle cleanup and provides toggle control. Ideal for polling, timers, or any repeated execution.

## Usage Logic

Starts the interval immediately on mount (unless `enabled: false` is passed). The interval pauses when `delay` is `null` or when `enabled` is `false`. Supports `immediate` mode — fires the callback once immediately before the first interval tick.

## Type Signature

```ts
function useInterval(
  callback: () => void,
  delay: number | null,
  options?: {
    immediate?: boolean;
    enabled?: boolean;
  }
): void;
```

## Example Code

```tsx
import { useInterval } from "@musecat/functionkit";

function PollingComponent() {
  const [data, setData] = useState(null);

  useInterval(
    () => fetch("/api/status").then(setData),
    5000,
    { immediate: true }
  );

  return <div>{data}</div>;
}
```

## Trade-off

Internally uses `usePreservedCallback` to stabilize the callback. The callback always reflects the latest closure, but during the render-to-effect gap a stale version could theoretically fire. In practice this is never an issue since interval callbacks fire asynchronously after paint. See `usePreservedCallback` trade-off for details.
