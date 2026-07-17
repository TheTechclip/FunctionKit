# useAvoidKeyboard

## Purpose

Returns a style object that pushes the bottom of the viewport upward via `translateY` when the virtual keyboard appears. Useful for fixing mobile layout issues where the keyboard overlaps input fields.

## Usage Logic

Internally subscribes to `useKeyboardHeight`. When the keyboard opens, the returned style applies a negative `translateY` equal to the keyboard height, keeping the focused element visible. The transition is animated via CSS `transition`.

## Type Signature

```ts
function useAvoidKeyboard(): React.CSSProperties
```

Returns a style object containing `transform`, `transition`, and `willChange` properties.

## Example Code

```tsx
import { useAvoidKeyboard } from "@musecat/functionkit";
import { View } from "./YourView";

function ChatInput() {
  const keyboardStyle = useAvoidKeyboard();
  return <View style={keyboardStyle}>...</View>;
}
```
