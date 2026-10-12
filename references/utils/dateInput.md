# dateInput

> 상태: Reference
>
> Runtime: Universal
>
> Public surface: `@musecat/functionkit/web`

**Source:** [implementation](../../web/packages/utils/dateInput.ts)
**Tests:** [contract tests](../../tests/utils/dateInput.test.ts)

## 목적과 소유권

Product-neutral dateInput mechanisms, shared by UI and application consumers.

Date-only validation compares the resulting ISO calendar key with the complete trimmed input, so a rollover in any calendar field is rejected.

## Public API

`DateInput, toDate, toUtcMidnight, parseUtcDateInput, formatUtcDateKey, getUtcWeekdayIndex, addUtcDays`. Source signatures define accepted arguments and return types.

## Runtime과 dependency

Universal. No application imports; only standard JavaScript APIs.

## 동작 계약

UTC calculations are independent of application locale and browser state. Date objects are cloned. `parseUtcDateInput` trims and validates exact `YYYY-MM-DD` strings by calendar roundtrip, returning UTC midnight without normalizing impossible days or months. Years `0000` through `0099` retain their literal year, including when `toUtcMidnight` receives a Date. Other inputs and `toDate` use standard Date parsing. Invalid primary input uses the optional valid fallback (with the same date-only validation), otherwise returns null. UTC day arithmetic preserves the input. `formatUtcDateKey` retains its numeric year formatting; it does not pad the year to four digits.

## 접근성

No interactive surface is rendered.

## 오류와 cleanup

`parseUtcDateInput("2026-02-30")` returns null, not March 2. `parseUtcDateInput("2026-13-01", "2024-02-29")` returns the valid fallback at UTC midnight. An impossible fallback such as `"2026-04-31"` also returns null. These helpers create no listeners or timers and require no cleanup. Invalid Date inputs remain invalid in `toUtcMidnight`; use `toDate` or `parseUtcDateInput` when validation is needed.

## 예제

```ts
import { parseUtcDateInput } from "@musecat/functionkit/web";

parseUtcDateInput(" 0007-01-02 ")?.toISOString(); // "0007-01-02T00:00:00.000Z"
parseUtcDateInput("1900-02-29"); // null (not a leap year)
parseUtcDateInput("2000-02-29"); // UTC midnight on leap day
parseUtcDateInput("invalid", "2026-10-08"); // UTC midnight on October 8
```

## 금지 패턴

Consumers must not deep-import implementation paths or move application policy into these helpers.

## 검증

The linked tests exercise calendar rejection, leap years, literal early years, valid and invalid fallbacks, Date cloning, and UTC arithmetic.
