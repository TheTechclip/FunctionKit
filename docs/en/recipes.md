# Recipes

[English](./recipes.md) | [한국어](../ko/recipes.md)

## Controlled or uncontrolled state

```tsx check
"use client";

import { useControllableState } from "@musecat/functionkit";

type DisclosureProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Disclosure({ open, defaultOpen = false, onOpenChange }: DisclosureProps) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
  });

  function toggle() {
    const next = !isOpen;
    setOpen(next);
    onOpenChange?.(next);
  }

  return <button type="button" aria-expanded={isOpen} onClick={toggle}>{isOpen ? "Close" : "Open"}</button>;
}
```

The hook accepts only `value` and `defaultValue`. Its setter changes internal state only in uncontrolled mode; controlled mode requires the parent to update `open` through `onOpenChange`. The component, not the hook, owns that callback. See the [reference](../../references/hooks/useControllableState.md).

## Read state without coupling serialization to persistence

Run this from a browser event or effect, not during server rendering.

```ts check
import {
  hasReadState,
  markStorageReadState,
} from "@musecat/functionkit";

const key = "product-tour-read";
const item = "search-v2";

const current = localStorage.getItem(key);
if (!hasReadState(current, item)) {
  markStorageReadState(localStorage, key, [item]);
}
```

Switch to the cookie adapter when the server also needs the persisted value. The serialized format stays the same.

## A dark/light decision owned by the application

```tsx check
"use client";

import {
  resolveLuminanceThreshold,
  useLayerLuminance,
} from "@musecat/functionkit";
import { useMemo, useRef } from "react";

export function FloatingControl() {
  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const targets = useMemo(() => [controlRef], []);
  const [luminance] = useLayerLuminance(rootRef, targets);

  const reversed = resolveLuminanceThreshold(false, luminance, {
    darkenAt: 0.35,
    lightenAt: 0.55,
  });

  return (
    <div ref={rootRef}>
      <button ref={controlRef} data-reversed={reversed || undefined}>
        Next
      </button>
    </div>
  );
}
```

The numbers are application policy. FunctionKit does not choose them for you.

## Keyboard navigation for a list widget

`useKeyboardListNavigation` is intentionally lower-level than a menu or select component. Use it when your component owns item semantics but wants consistent arrow/Home/End/typeahead behavior. See the [full keyboard contract](../../references/hooks/useKeyboardListNavigation.md) before implementing ARIA behavior; keyboard movement alone does not make a widget accessible.

## Scroll to an explicit destination

```tsx check
"use client";

import { ScrollTo } from "@musecat/functionkit";

export function RouteReset() {
  return <ScrollTo top={0} left={0} />;
}
```

Or scroll an owned element:

```tsx check
"use client";

import { ScrollTo } from "@musecat/functionkit";
import { useRef } from "react";

export function PanelReset() {
  const panelRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={panelRef} style={{ height: 200, overflow: "auto" }}>
      <ScrollTo target={panelRef} top={320} behavior="smooth" />
      <div style={{ height: 1000 }}>Scrollable content</div>
    </div>
  );
}
```

The component does not move focus. Navigation focus management remains application responsibility.

## Checking examples

Fences labelled `ts check` or `tsx check` are complete, independent modules. Run `bun scripts/checkDocumentationSnippets.mjs` from the FunctionKit directory to type-check them against the real public Web exports with strict TypeScript checks. API declaration blocks are reference signatures, not executable examples.
