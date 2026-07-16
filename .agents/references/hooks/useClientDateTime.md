# useClientDateTime

## Purpose

Formats a date on the client side using the user's locale and timezone. Returns the formatted text inside a `useEffect`, ensuring hydration safety via a `ready` flag.

## Usage Logic

Takes a `DateInput` and locale, then computes the formatted date/time string on mount and whenever inputs change. Returns a `ready` boolean (initially `false`) so the component can render a fallback (e.g., server-rendered date) before hydration completes.

## Type Signature

```ts
function useClientDateTime(
  date: DateInput,
  locale: AppLocale,
  options?: {
    datePreset?: DatePreset;
    timePreset?: TimePreset;
  }
): {
  ready: boolean;
  text: string;
  date: Date | null;
}
```

## Example Code

```tsx
import { useClientDateTime } from "@musecat/functionkit";

function PostDate({ timestamp }: { timestamp: string }) {
  const { ready, text } = useClientDateTime(timestamp, "kr", {
    datePreset: "long",
  });
  return <time>{ready ? text : timestamp}</time>;
}
```
