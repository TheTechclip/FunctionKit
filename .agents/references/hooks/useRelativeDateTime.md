# useRelativeDateTime

## Purpose

Displays a date as a relative time string ("3 minutes ago", "2 hours ago") that updates automatically. Falls back to a formatted date string when the relative time exceeds a configurable threshold.

## Usage Logic

Computes the difference between now and the given date, then formats it using `formatRelativeText`. Recomputes on a configurable interval (`updateIntervalMs`, default 1000ms). If the difference exceeds `maxRelativeDays`, returns a standard date format instead.

## Type Signature

```ts
function useRelativeDateTime(
  date: DateInput,
  locale: AppLocale,
  options?: {
    updateIntervalMs?: number;
    maxRelativeDays?: number;
  }
): string;
```

## Example Code

```tsx
import { useRelativeDateTime } from "@musecat/functionkit";

function Timestamp({ time }: { time: string }) {
  const relative = useRelativeDateTime(time, "kr", {
    maxRelativeDays: 7,
  });
  return <span>{relative}</span>;
}
```
