# useDebouncedCallback

## Purpose

Provides a debounced callback for boolean value changes. It debounces the *invocation* of a callback and automatically cancels a pending change when the value returns to its last committed value.

## Usage Logic

Wraps the `onChange` handler so it only fires after `timeThreshold` ms of inactivity. Each call replaces the previous pending timer, acting as a "settled" change detector.

## Type Signature

```ts
function useDebouncedCallback(options: {
  onChange: (value: boolean) => void;
  timeThreshold: number;
  leading?: boolean;
  trailing?: boolean;
}): (value: boolean) => void;
```

Returns a memoized setter that debounces calls to `onChange`.

## Example Code

```tsx
import { useDebouncedCallback } from "@musecat/functionkit";

function ToggleTracker() {
  const handleChange = useDebouncedCallback({
    onChange: (value) => console.log("Toggle settled:", value),
    timeThreshold: 500,
  });

  return <Toggle onChange={handleChange} />;
}
```
