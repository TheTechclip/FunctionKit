"use client";

import { type MouseEvent, useCallback, useEffect, useRef } from "react";

type UseDoubleClickProps<E extends HTMLElement> = {
  delay?: number;
  click?: (event: MouseEvent<E>) => void;
  doubleClick: (event: MouseEvent<E>) => void;
};

export function useDoubleClick<E extends HTMLElement = HTMLElement>({
  delay = 250,
  click,
  doubleClick,
}: UseDoubleClickProps<E>) {
  const clickTimeout = useRef<number | null>(null);

  const savedClick = useRef(click);
  const savedDoubleClick = useRef(doubleClick);
  savedClick.current = click;
  savedDoubleClick.current = doubleClick;

  useEffect(() => {
    return () => {
      if (clickTimeout.current != null) {
        window.clearTimeout(clickTimeout.current);
      }
    };
  }, []);

  const handleEvent = useCallback(
    (event: MouseEvent<E>) => {
      if (clickTimeout.current != null) {
        window.clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
      }

      if (event.detail === 1 && savedClick.current) {
        clickTimeout.current = window.setTimeout(() => {
          clickTimeout.current = null;
          savedClick.current?.(event);
        }, delay);
      }

      if (event.detail === 2) {
        savedDoubleClick.current(event);
      }
    },
    [delay],
  );

  return handleEvent;
}
