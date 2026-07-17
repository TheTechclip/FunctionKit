# useRefEffect

## Purpose

Provides a ref callback that runs an effect when the element mounts and optionally runs a cleanup when it unmounts or when dependencies change. Similar to `useEffect` but keyed to a DOM element's lifecycle.

## Usage Logic

Returns a callback ref. When React calls the ref with an element, the effect function runs. When it's called with `null` (unmount) or when `deps` change, the previous cleanup is called before running the new effect.

## Type Signatures

```ts
type CleanupCallback = () => void;

function useRefEffect(
  effect: (el: HTMLElement) => CleanupCallback | void,
  deps?: any[]
): (el: HTMLElement | null) => void;
```

## Example Code

```tsx
import { useRefEffect } from "@musecat/functionkit";

function AutoFocus() {
  const ref = useRefEffect((el) => {
    el.focus();
    return () => console.log("unmounted");
  }, []);

  return <input ref={ref} />;
}
```
