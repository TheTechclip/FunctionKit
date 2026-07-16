"use client";

import { useEffect, useState } from "react";
import { formatClientRelative } from "../datetime/dateTime.client";
import type { DateInput, DatePreset } from "../datetime/dateTime.shared";
import { toDate } from "../datetime/dateTime.shared";

type UseRelativeDateTimeOptions = {
  locale?: string;
  maxRelativeDays?: number;
  fallbackDatePreset?: DatePreset;
  updateIntervalMs?: number;
};

export function useRelativeDateTime(
  value: DateInput,
  options?: UseRelativeDateTimeOptions,
) {
  const [ready, setReady] = useState(false);
  const [text, setText] = useState("");
  const [isRelative, setIsRelative] = useState(false);

  useEffect(() => {
    const update = () => {
      const next = formatClientRelative(value, {
        locale: options?.locale,
        maxRelativeDays: options?.maxRelativeDays,
        fallbackDatePreset: options?.fallbackDatePreset,
        now: Date.now(),
      });
      setText(next.text);
      setIsRelative(next.isRelative);
      setReady(true);
    };

    update();

    const timer = window.setInterval(update, options?.updateIntervalMs ?? 1000);
    return () => window.clearInterval(timer);
  }, [
    options?.fallbackDatePreset,
    options?.locale,
    options?.maxRelativeDays,
    options?.updateIntervalMs,
    value,
  ]);

  return {
    ready,
    text,
    isRelative,
    date: toDate(value),
  };
}
