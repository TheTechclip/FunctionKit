"use client";

import { useMemo } from "react";

import { usePreservedCallback } from "./usePreservedCallback";
import { useRefEffect } from "./useRefEffect";

export function useIntersectionObserver<Element extends HTMLElement>(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit,
): (element: Element | null) => void {
  const preservedCallback = usePreservedCallback(callback);

  const observer = useMemo(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    return new IntersectionObserver(([entry]) => {
      preservedCallback(entry);
    }, options);
  }, [preservedCallback, options]);

  return useRefEffect<Element>(
    (element) => {
      observer?.observe(element);

      return () => {
        observer?.unobserve(element);
      };
    },
    [preservedCallback, options],
  );
}
