# dateTime.server

## Purpose

Server-side date/time formatting wrappers. Use in Server Components, RSC, and any server-side rendering context. Pure functions, SSR-safe.

## Usage Logic

Delegates to `dateTime.shared` utilities internally. Provides simplified `DatePreset`/`TimePreset`-based APIs that compose multiple shared functions.

## Type Signatures

```ts
function formatServerDate(date: DateInput, locale: AppLocale, preset?: DatePreset): string;
function formatServerTime(date: DateInput, locale: AppLocale, preset?: TimePreset): string;
function formatServerDateTime(
  date: DateInput,
  locale: AppLocale,
  options?: { datePreset?: DatePreset; timePreset?: TimePreset }
): string;
function formatServerRelative(
  date: DateInput,
  locale: AppLocale,
  options?: { maxRelativeDays?: number }
): string;
```

## Example Code

```tsx
import { formatServerDate, formatServerRelative } from "@musecat/functionkit";

// Server Component
export default function ArticlePage({ post }: { post: { createdAt: string } }) {
  return (
    <article>
      <time>{formatServerDate(post.createdAt, "kr", "long")}</time>
      <span>{formatServerRelative(post.createdAt, "kr", { maxRelativeDays: 7 })}</span>
    </article>
  );
}
```
