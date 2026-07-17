# SwitchCase

## Purpose

A declarative `switch`/`case` component for JSX. Renders the matching `ReactNode` based on a value, with an optional fallback (`otherwise`). Eliminates messy ternary chains and `&&` conditions.

## Usage Logic

Takes a `value` and a `cases` record. Iterates over the keys of `cases` and returns the first match using `Object.hasOwn`. If no key matches, renders `otherwise` (or `null`).

SSR-safe — pure function with no `"use client"`.

## Type Signature

```ts
interface SwitchCaseProps<T extends string | number> {
  value: T;
  cases: Partial<Record<T, ReactNode>>;
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

## Note

Not exported from the barrel. Import via component subpath.
