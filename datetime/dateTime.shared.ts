export type AppLocale = "kr" | "en" | "jp";
export type DateInput = string | number | Date;
export type DatePreset = "long" | "dot";
export type TimePreset = "ko" | "12h" | "24h-minute" | "24h-second";
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

type DateParts = {
  year: string;
  month: string;
  day: string;
};

type TimeParts = {
  hour: string;
  minute: string;
  second: string;
};

export function normalizeAppLocale(locale?: string): AppLocale {
  const normalized =
    typeof locale === "string" ? locale.trim().toLowerCase() : "";
  if (normalized === "kr" || normalized === "ko") return "kr";
  if (normalized === "jp" || normalized === "ja") return "jp";
  return "en";
}

export function toIntlLocale(locale?: string): string {
  switch (normalizeAppLocale(locale)) {
    case "kr":
      return "ko-KR";
    case "jp":
      return "ja-JP";
    default:
      return "en-US";
  }
}

export function toDate(value: DateInput): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toUtcMidnight(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function parseUtcDateInput(
  value?: DateInput | null,
  fallback?: DateInput,
): Date | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    const match = DATE_ONLY_PATTERN.exec(trimmed);

    if (match) {
      const [, year, month, day] = match;
      return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    }
  }

  const parsed = value !== undefined && value !== null ? toDate(value) : null;
  if (parsed) {
    return toUtcMidnight(parsed);
  }

  if (fallback !== undefined) {
    const fallbackDate = toDate(fallback);
    if (fallbackDate) {
      return toUtcMidnight(fallbackDate);
    }
  }

  return null;
}

export function formatUtcDateKey(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function getUtcWeekdayIndex(date: Date): number {
  return date.getUTCDay();
}

export function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getDateParts(date: Date, timeZone?: string): DateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: parts.find((part) => part.type === "year")?.value ?? "0000",
    month: parts.find((part) => part.type === "month")?.value ?? "00",
    day: parts.find((part) => part.type === "day")?.value ?? "00",
  };
}

function getTimeParts(date: Date, timeZone?: string): TimeParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return {
    hour: parts.find((part) => part.type === "hour")?.value ?? "00",
    minute: parts.find((part) => part.type === "minute")?.value ?? "00",
    second: parts.find((part) => part.type === "second")?.value ?? "00",
  };
}

export function formatLongDate(
  date: Date,
  locale?: string,
  timeZone?: string,
): string {
  const localeKey = normalizeAppLocale(locale);
  const { year, month, day } = getDateParts(date, timeZone);

  if (localeKey === "kr") {
    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  }

  if (localeKey === "jp") {
    return `${year}年${Number(month)}月${Number(day)}日`;
  }

  return new Intl.DateTimeFormat(toIntlLocale(localeKey), {
    timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDotDate(date: Date, timeZone?: string): string {
  const { year, month, day } = getDateParts(date, timeZone);
  return `${year}. ${Number(month)}. ${Number(day)}.`;
}

export function format24HourTime(
  date: Date,
  options?: {
    includeSeconds?: boolean;
    timeZone?: string;
  },
): string {
  const { includeSeconds = false, timeZone } = options ?? {};
  const { hour, minute, second } = getTimeParts(date, timeZone);
  return includeSeconds ? `${hour}:${minute}:${second}` : `${hour}:${minute}`;
}

export function formatKoreanTime(date: Date, timeZone?: string): string {
  const { hour, minute } = getTimeParts(date, timeZone);
  const hourNumber = Number(hour);
  const meridiem = hourNumber < 12 ? "오전" : "오후";
  const hour12 = hourNumber % 12 === 0 ? 12 : hourNumber % 12;
  return `${meridiem} ${hour12}시 ${minute}분`;
}

export function formatTwelveHourTime(
  date: Date,
  locale?: string,
  timeZone?: string,
): string {
  const localeKey = normalizeAppLocale(locale);
  if (localeKey === "kr") {
    const { hour, minute } = getTimeParts(date, timeZone);
    const hourNumber = Number(hour);
    const meridiem = hourNumber < 12 ? "오전" : "오후";
    const hour12 = hourNumber % 12 === 0 ? 12 : hourNumber % 12;
    return `${meridiem} ${hour12}:${minute}`;
  }

  return new Intl.DateTimeFormat(toIntlLocale(localeKey), {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatRelativeText(
  diffMs: number,
  locale?: string,
): { text: string; isRelative: boolean } {
  const localeKey = normalizeAppLocale(locale);
  const safeDiffMs = Math.max(0, diffMs);
  const seconds = Math.max(1, Math.floor(safeDiffMs / 1000));
  const minutes = Math.max(1, Math.floor(safeDiffMs / (60 * 1000)));
  const hours = Math.max(1, Math.floor(safeDiffMs / (60 * 60 * 1000)));
  const days = Math.max(1, Math.floor(safeDiffMs / (24 * 60 * 60 * 1000)));

  if (safeDiffMs < 60 * 1000) {
    return {
      text: formatRelativeUnit(seconds, "second", localeKey),
      isRelative: true,
    };
  }

  if (safeDiffMs < 60 * 60 * 1000) {
    return {
      text: formatRelativeUnit(minutes, "minute", localeKey),
      isRelative: true,
    };
  }

  if (safeDiffMs < 24 * 60 * 60 * 1000) {
    return {
      text: formatRelativeUnit(hours, "hour", localeKey),
      isRelative: true,
    };
  }

  return { text: formatRelativeUnit(days, "day", localeKey), isRelative: true };
}

export function formatRemainingText(
  diffMs: number,
  locale?: string,
  options?: {
    includeSuffix?: boolean;
  },
): string {
  const localeKey = normalizeAppLocale(locale);
  const includeSuffix = options?.includeSuffix ?? true;
  const safeDiffMs = Math.max(0, diffMs);

  if (safeDiffMs === 0) {
    if (localeKey === "kr") return "마감됨";
    if (localeKey === "jp") return "締切終了";
    return "Closed";
  }

  const units = [
    { label: "day", value: 24 * 60 * 60 * 1000 },
    { label: "hour", value: 60 * 60 * 1000 },
    { label: "minute", value: 60 * 1000 },
    { label: "second", value: 1000 },
  ] as const;

  const parts: string[] = [];
  let remaining = safeDiffMs;

  for (const unit of units) {
    const count = Math.floor(remaining / unit.value);
    remaining -= count * unit.value;

    if (count > 0) {
      parts.push(formatRemainingUnit(count, unit.label, localeKey));
    }

    if (parts.length >= 2) break;
  }

  if (parts.length === 0) {
    parts.push(formatRemainingUnit(1, "second", localeKey));
  }

  if (!includeSuffix) {
    return parts.join(localeKey === "jp" ? "" : " ");
  }

  if (localeKey === "kr") {
    return `${parts.join(" ")} 남음`;
  }

  if (localeKey === "jp") {
    return `あと${parts.join("")}`;
  }

  return `${parts.join(" ")} left`;
}

function formatRelativeUnit(
  count: number,
  unit: "second" | "minute" | "hour" | "day",
  locale: AppLocale,
): string {
  if (locale === "kr") {
    const suffix =
      unit === "second"
        ? "초"
        : unit === "minute"
          ? "분"
          : unit === "hour"
            ? "시간"
            : "일";
    return `${count}${suffix} 전`;
  }

  if (locale === "jp") {
    const suffix =
      unit === "second"
        ? "秒"
        : unit === "minute"
          ? "分"
          : unit === "hour"
            ? "時間"
            : "日";
    return `${count}${suffix}前`;
  }

  const englishUnit = count === 1 ? unit : `${unit}s`;
  return `${count} ${englishUnit} ago`;
}

function formatRemainingUnit(
  count: number,
  unit: "second" | "minute" | "hour" | "day",
  locale: AppLocale,
): string {
  if (locale === "kr") {
    const suffix =
      unit === "second"
        ? "초"
        : unit === "minute"
          ? "분"
          : unit === "hour"
            ? "시간"
            : "일";
    return `${count}${suffix}`;
  }

  if (locale === "jp") {
    const suffix =
      unit === "second"
        ? "秒"
        : unit === "minute"
          ? "分"
          : unit === "hour"
            ? "時間"
            : "日";
    return `${count}${suffix}`;
  }

  const englishUnit = count === 1 ? unit : `${unit}s`;
  return `${count} ${englishUnit}`;
}
