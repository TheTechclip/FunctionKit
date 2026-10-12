# calendar

> 상태: Reference
>
> Runtime: Universal
>
> Public surface: `@musecat/functionkit/web`

**Source:** [implementation](../../web/packages/utils/calendar.ts)
**Tests:** [contract tests](../../tests/datetime/calendar.test.ts)

## 목적과 소유권

Product-neutral calendar mechanisms, shared by UI and application consumers.

## Public API

`parseLocalDateInput, formatLocalDateInput, formatLocalDateDisplay, formatLocalDateRangeDisplay, getCalendarDays, isSameCalendarDay, isBeforeDate, isDateDisabled`. Source signatures define accepted arguments and return types.

## Runtime과 dependency

Universal. No application imports; only standard JavaScript APIs.

## 동작 계약

Local timezone calculations; parsing invalid values returns null. Calendar rows start on Sunday and include adjacent-month days. Display values use the dotted date form. Bounds ignore invalid dates.

## 접근성

No interactive surface is rendered.

## 오류와 cleanup

Calculations allocate no timers, listeners or browser resources. An invalid local
date string returns `null`; callers should not substitute a UTC date and assume
it represents the same local calendar day. Invalid bound dates are ignored.

## 예제

```ts
import { parseLocalDateInput, formatLocalDateInput } from "@musecat/functionkit";

const date = parseLocalDateInput("2026-10-08");
if (date) console.log(formatLocalDateInput(date)); // "2026-10-08" in local time
```

## 금지 패턴

Consumers must not deep-import implementation paths or move application policy into these helpers.

## 검증

The linked tests exercise input handling, calculations and cleanup according to the contracts above.
