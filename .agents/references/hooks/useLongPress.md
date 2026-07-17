# useLongPress

## Purpose

Detects a long press gesture on an element. Fires `onLongPress` after the user presses and holds for a configurable delay, with optional `onClick` for tap and `onLongPressEnd` for release.

## Usage Logic

Tracks both mouse and touch events. On `mousedown`/`touchstart`, starts a timer. If the pointer moves beyond `moveThreshold` pixels, the gesture is cancelled. If the timer expires without cancellation, `onLongPress` fires. On release, `onLongPressEnd` fires (if it was a long press), or `onClick` fires (if it was a short tap).

## Type Signature

```ts
function useLongPress(
  handlers: {
    onLongPress: (e: MouseEvent | TouchEvent) => void;
    onClick?: (e: MouseEvent | TouchEvent) => void;
    onLongPressEnd?: (e: MouseEvent | TouchEvent) => void;
  },
  options?: {
    delay?: number;
    moveThreshold?: number;
  }
): {
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
};
```

## Example Code

```tsx
import { useLongPress } from "@musecat/functionkit";

function LongPressButton() {
  const handlers = useLongPress({
    onLongPress: () => console.log("hold complete"),
    onClick: () => console.log("tap"),
    onLongPressEnd: () => console.log("released"),
  });

  return <button {...handlers}>Press & hold</button>;
}
```
