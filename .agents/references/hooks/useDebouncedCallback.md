# useDebouncedCallback

## Purpose

Provides a debounced callback for boolean value changes. Unlike `useDebounce` which debounces a value, this hook debounces the *invocation* of a callback, automatically canceling the previous pending call.

## Usage Logic

Wraps the `onChange` handler so it only fires after `timeThreshold` ms of inactivity. Each call replaces the previous pending timer, acting as a "settled" change detector.

## Type Signature

```ts
function useDebouncedCallback(
  onChange: (value: boolean) => void,
  timeThreshold: number
): (value: boolean) => void;
```

Returns a memoized setter that debounces calls to `onChange`.

## Example Code

```tsx
import { useDebouncedCallback } from "@musecat/functionkit";

function ToggleTracker() {
  const handleChange = useDebouncedCallback((value) => {
    console.log("Toggle settled:", value);
  }, 500);

  return <Toggle onChange={handleChange} />;
}
```
