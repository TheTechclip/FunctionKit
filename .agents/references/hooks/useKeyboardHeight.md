# useKeyboardHeight

## Purpose

Returns the current virtual keyboard height in pixels by subscribing to `visualViewport` changes. Useful for adjusting layout when the keyboard opens on mobile.

## Usage Logic

Internally uses `subscribeKeyboardHeight` which listens to `visualViewport.resize` and `visualViewport.scroll` events. Computes the height as the difference between the full viewport and the visual viewport.

## Type Signature

```ts
function useKeyboardHeight(): number;
```

Returns the keyboard height in pixels (0 when the keyboard is closed).

## Example Code

```tsx
import { useKeyboardHeight } from "@musecat/functionkit";

function ChatLayout() {
  const kbHeight = useKeyboardHeight();
  return (
    <div style={{ paddingBottom: kbHeight }}>
      <MessageList />
      <InputBar />
    </div>
  );
}
```
