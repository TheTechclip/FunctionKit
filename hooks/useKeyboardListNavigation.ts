"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isEditableKeyboardTarget } from "../utils/keyboardTarget";

const FIRST_ITEM_KEYS = new Set(["ArrowDown", "ArrowRight", "Home"]);
const LAST_ITEM_KEYS = new Set(["ArrowUp", "ArrowLeft", "End"]);

type UseKeyboardListNavigationOptions = {
  itemCount: number;
};

export function useKeyboardListNavigation({
  itemCount,
}: UseKeyboardListNavigationOptions) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const setItemRef = useCallback(
    (index: number, element: HTMLElement | null) => {
      itemRefs.current[index] = element;
    },
    [],
  );

  const focusItem = useCallback((index: number) => {
    const target = itemRefs.current[index];
    if (!target) {
      return false;
    }

    setActiveIndex(index);
    target.focus();
    target.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
    return true;
  }, []);

  const focusBoundaryItem = useCallback(
    (key: string) => {
      if (itemCount === 0) {
        return false;
      }

      if (FIRST_ITEM_KEYS.has(key)) {
        return focusItem(0);
      }

      if (LAST_ITEM_KEYS.has(key)) {
        return focusItem(itemCount - 1);
      }

      return false;
    },
    [focusItem, itemCount],
  );

  const moveActiveItem = useCallback(
    (key: string) => {
      if (itemCount === 0) {
        return false;
      }

      if (key === "Home") {
        return focusItem(0);
      }

      if (key === "End") {
        return focusItem(itemCount - 1);
      }

      if (key === "ArrowDown" || key === "ArrowRight") {
        const nextIndex = activeIndex < 0 ? 0 : (activeIndex + 1) % itemCount;
        return focusItem(nextIndex);
      }

      if (key === "ArrowUp" || key === "ArrowLeft") {
        const nextIndex =
          activeIndex < 0
            ? itemCount - 1
            : (activeIndex - 1 + itemCount) % itemCount;
        return focusItem(nextIndex);
      }

      return false;
    },
    [activeIndex, focusItem, itemCount],
  );

  const clickActiveItem = useCallback(() => {
    if (activeIndex < 0) {
      return false;
    }

    itemRefs.current[activeIndex]?.click();
    return true;
  }, [activeIndex]);

  const handleListKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLElement>,
      options?: { container?: HTMLElement | null },
    ) => {
      if (itemCount === 0 || event.defaultPrevented) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      if (isEditableKeyboardTarget(target)) {
        return;
      }

      if (options?.container && !options.container.contains(target)) {
        return;
      }

      if (event.key === "Escape") {
        setActiveIndex(-1);
        return;
      }

      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        event.preventDefault();
      }

      if (event.key === "Enter" || event.key === " ") {
        clickActiveItem();
        return;
      }

      if (moveActiveItem(event.key)) {
        return;
      }

      if (focusBoundaryItem(event.key)) {
        return;
      }
    },
    [clickActiveItem, moveActiveItem, focusBoundaryItem, itemCount],
  );

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, itemCount);
  }, [itemCount]);

  return {
    activeIndex,
    setActiveIndex,
    setItemRef,
    clickActiveItem,
    focusBoundaryItem,
    handleListKeyDown,
  };
}
