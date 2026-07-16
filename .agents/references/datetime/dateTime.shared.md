# dateTime.shared

## Purpose

Core date/time formatting utilities and types. All functions are pure and SSR-safe — no `"use client"`, no `window` access. Forms the foundation for both server and client date wrappers.

## Types

```ts
type AppLocale = "kr" | "en" | "jp";
type DateInput = string | number | Date;
type DatePreset = "long" | "dot";
type TimePreset = "ko" | "12h" | "24h-minute" | "24h-second";
```

## Locale Conversion

```ts
// "ko" → "kr", "ja" → "jp", anything else → "en"
function normalizeAppLocale(locale: string): AppLocale;

// "kr" → "ko-KR", "jp" → "ja-JP", "en" → "en-US"
function toIntlLocale(locale: AppLocale): string;
```

## UTC Date Utilities

```ts
function toDate(input: DateInput): Date | null;                        // NaN-safe Date conversion
function toUtcMidnight(date: Date): Date;                              // UTC midnight of the given date
function parseUtcDateInput(input: string): Date | null;                // "YYYY-MM-DD" → UTC Date
function formatUtcDateKey(date: Date): string;                         // UTC Date → "YYYY-MM-DD"
function getUtcWeekdayIndex(date: Date): number;                       // 0=Sunday
function addUtcDays(date: Date, days: number): Date;                   // Add days in UTC
```

## Formatted Output Functions

```ts
// Long date: "2026년 7월 16일" / "July 16, 2026" / "2026年7月16日"
function formatLongDate(date: DateInput, locale: AppLocale): string;

// Dot date: "2026. 7. 16."
function formatDotDate(date: DateInput, locale: AppLocale): string;

// 24-hour time: "14:30" or "14:30:00"
function format24HourTime(date: DateInput, options?: { withSeconds?: boolean }): string;

// Korean time: "오후 2시 30분"
function formatKoreanTime(date: DateInput): string;

// 12-hour with locale: "오후 2:30" / "2:30 PM" / "午後 2:30"
function formatTwelveHourTime(date: DateInput, locale: AppLocale): string;
```

## Relative / Remaining Time

```ts
// Relative: { text: "3분 전", isRelative: true }
function formatRelativeText(diffMs: number, locale: AppLocale): { text: string; isRelative: boolean };

// Remaining: "2일 3시간 남음" / "2 days 3 hours left" / "あと2日3時間"
function formatRemainingText(diffMs: number, locale: AppLocale): string;
```

## Example Code

```tsx
import {
  formatLongDate,
  formatRelativeText,
  formatUtcDateKey,
  normalizeAppLocale,
  toIntlLocale,
} from "@musecat/functionkit";

function EventDate({ date, locale }: { date: Date; locale: string }) {
  const appLocale = normalizeAppLocale(locale);
  return <time>{formatLongDate(date, appLocale)}</time>;
}

function RelativeTime({ diffMs }: { diffMs: number }) {
  const { text, isRelative } = formatRelativeText(diffMs, "kr");
  return <span>{text}</span>;
}
```
