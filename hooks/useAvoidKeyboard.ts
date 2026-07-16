"use client";

import { useKeyboardHeight } from "./useKeyboardHeight";

type UseAvoidKeyboardOptions = {
  safeAreaBottom?: number;
  transitionDuration?: number;
  transitionTimingFunction?: string;
};

export function useAvoidKeyboard(options?: UseAvoidKeyboardOptions) {
  const {
    safeAreaBottom = 0,
    transitionDuration = 200,
    transitionTimingFunction = "ease-out",
  } = options ?? {};

  const { keyboardHeight } = useKeyboardHeight();

  const offset = keyboardHeight > 0 ? keyboardHeight : safeAreaBottom;

  const style: React.CSSProperties = {
    transform: offset > 0 ? `translateY(-${offset}px)` : undefined,
    transition: `transform ${transitionDuration}ms ${transitionTimingFunction}`,
  };

  return { style };
}
