"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether the current viewport matches a media query.
 *
 * @param mediaQuery CSS media query string.
 * @returns True when current viewport matches the given query.
 */
export function useViewportMatch(mediaQuery: string): boolean {
  const [isMatched, setIsMatched] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(mediaQuery);
    const syncMatchState = () => {
      setIsMatched(mediaQueryList.matches);
    };

    syncMatchState();
    mediaQueryList.addEventListener("change", syncMatchState);

    return () => {
      mediaQueryList.removeEventListener("change", syncMatchState);
    };
  }, [mediaQuery]);

  return isMatched;
}
