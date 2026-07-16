"use client";

import { useEffect, useState } from "react";
import { formatClientDateTime } from "../datetime/dateTime.client";
import type {
  DateInput,
  DatePreset,
  TimePreset,
} from "../datetime/dateTime.shared";
import { toDate } from "../datetime/dateTime.shared";

type UseClientDateTimeOptions = {
  locale?: string;
  timeZone?: string;
  datePreset?: DatePreset;
  timePreset?: TimePreset;
};

export function useClientDateTime(
  value: DateInput,
  options?: UseClientDateTimeOptions,
) {
  const [ready, setReady] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    setText(
      formatClientDateTime(value, {
        locale: options?.locale,
        timeZone: options?.timeZone,
        datePreset: options?.datePreset,
        timePreset: options?.timePreset,
      }),
    );
    setReady(true);
  }, [
    options?.datePreset,
    options?.locale,
    options?.timePreset,
    options?.timeZone,
    value,
  ]);

  return {
    ready,
    text,
    date: toDate(value),
  };
}
