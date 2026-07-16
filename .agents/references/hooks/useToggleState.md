# useToggleState

## Purpose

Simplifies boolean state management with explicit `setTrue`, `setFalse`, and `toggle` setters. A more expressive alternative to raw `useState(false)`.

## Usage Logic

Wraps `useState<boolean>` with named setter functions. Accepts an optional initial value (default `false`).

## Type Signature

```ts
function useToggleState(
  initial?: boolean | (() => boolean)
): {
  value: boolean;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
};
```

## Example Code

```tsx
import { useToggleState } from "@musecat/functionkit";

function Collapsible({ children }: { children: React.ReactNode }) {
  const { value: isOpen, toggle } = useToggleState(false);

  return (
    <div>
      <button onClick={toggle}>{isOpen ? "Hide" : "Show"}</button>
      {isOpen && children}
    </div>
  );
}
```
