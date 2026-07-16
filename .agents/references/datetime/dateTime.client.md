# dateTime.client

## Purpose

Client-side date/time formatting wrappers. Same signatures as `dateTime.server` but bundled exclusively for client usage. Use in `"use client"` components only.

## Usage Logic

Same API surface as `dateTime.server` — identical function signatures. Separated to keep the server bundle clean of client-only code.

## Type Signatures

```ts
function formatClientDate(date: DateInput, locale: AppLocale, preset?: DatePreset): string;
function formatClientTime(date: DateInput, locale: AppLocale, preset?: TimePreset): string;
function formatClientDateTime(
  date: DateInput,
  locale: AppLocale,
  options?: { datePreset?: DatePreset; timePreset?: TimePreset }
): string;
function formatClientRelative(
  date: DateInput,
  locale: AppLocale,
  options?: { maxRelativeDays?: number }
): string;
```

## Example Code

```tsx
"use client";
import { formatClientDate, formatClientRelative } from "@musecat/functionkit";

function PostMeta({ createdAt }: { createdAt: string }) {
  return (
    <div>
      <time>{formatClientDate(createdAt, "kr", "long")}</time>
      <span>{formatClientRelative(createdAt, "kr")}</span>
    </div>
  );
}
```
