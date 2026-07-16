# mergeRefs

## Purpose

Combines multiple React refs (callback refs and/or object refs) into a single callback ref. Useful when forwarding refs from parent components while keeping internal refs.

## Usage Logic

Returns a callback ref that, when called with a DOM node, sets `ref.current` on all object refs and invokes all callback refs with the node. Filters out `undefined` refs.

## Type Signature

```ts
function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): (node: T) => void;
```

## Example Code

```tsx
import { mergeRefs } from "@musecat/functionkit";
import { forwardRef, useRef } from "react";

const Input = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const internalRef = useRef<HTMLInputElement>(null);
  return <input ref={mergeRefs(ref, internalRef)} {...props} />;
});
```
