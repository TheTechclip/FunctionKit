"use client";

import { useEffect, useState } from "react";

export function useCheckInvisible(className: string) {
  const [isInvisible, setIsInvisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.querySelector(`.${className}`);
      if (el) {
        const { top } = el.getBoundingClientRect();
        setIsInvisible(top < 0);
      } else {
        setIsInvisible(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [className]);

  return { isInvisible };
}
