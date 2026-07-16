# subscribeKeyboardHeight

## Purpose

A low-level utility that subscribes to `visualViewport` resize/scroll events and reports the estimated keyboard height. Used internally by `useKeyboardHeight`.

## Usage Logic

Attaches `resize` and `scroll` event listeners to `window.visualViewport`. Computes keyboard height as `window.innerHeight - visualViewport.height`. Throttles callbacks at the specified interval (default 16ms). Returns an unsubscribe function.

## Type Signature

```ts
function subscribeKeyboardHeight(
  handler: (height: number) => void,
  throttleMs?: number
): { unsubscribe: () => void };
```

## Example Code

```tsx
import { subscribeKeyboardHeight } from "@musecat/functionkit";
import { useEffect } from "react";

function useCustomKeyboardHandler() {
  useEffect(() => {
    const { unsubscribe } = subscribeKeyboardHeight(
      (height) => console.log("Keyboard height:", height),
      100
    );
    return unsubscribe;
  }, []);
}
```
