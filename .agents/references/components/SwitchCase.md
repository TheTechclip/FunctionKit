# SwitchCase

## Purpose

A declarative `switch`/`case` component for JSX. Renders the matching `ReactNode` based on a value, with an optional fallback (`otherwise`). Eliminates messy ternary chains and `&&` conditions.

## Usage Logic

Takes a `value` and a `cases` record, then returns the value at that key. The record may contain a broader set of string/number keys than the current value; this makes an explicit fallback type-safe. If no key matches, renders `otherwise` (or `null`).

SSR-safe — pure function with no `"use client"`.

## Type Signature

```ts
interface SwitchCaseProps<T extends string | number> {
  value: T;
  cases: Partial<Record<string | number, ReactNode>>;
  otherwise?: ReactNode;
}

function SwitchCase<T extends string | number>(props: SwitchCaseProps<T>): ReactNode;
```

## Example Code

```tsx
import { SwitchCase } from "@musecat/functionkit";

function StatusBadge({ status }: { status: "loading" | "success" | "error" }) {
  return (
    <SwitchCase
      value={status}
      cases={{
        loading: <Spinner />,
        success: <CheckIcon />,
        error: <ErrorIcon />,
      }}
      otherwise={<Fallback />}
    />
  );
}
```

## Import and SSR boundary

Exported from the root barrel. It is SSR-safe and can be used in Server Components, RSC, and Client Components.
