"use client";

type SubscribeKeyboardHeightOptions = {
  callback: (height: number) => void;
  immediate?: boolean;
  throttleMs?: number;
};

export function subscribeKeyboardHeight({
  callback,
  immediate = false,
  throttleMs = 16,
}: SubscribeKeyboardHeightOptions) {
  let ticking = false;
  let lastHeight = 0;

  const notify = (height: number) => {
    if (ticking) return;
    ticking = true;

    const run = () => {
      if (height !== lastHeight) {
        lastHeight = height;
        callback(height);
      }
      ticking = false;
    };

    if (throttleMs > 0) {
      setTimeout(run, throttleMs);
    } else {
      run();
    }
  };

  const handleResize = () => {
    const vv = window.visualViewport;
    if (!vv) return;
    const diff = window.innerHeight - vv.height;
    notify(diff > 0 ? diff : 0);
  };

  if (immediate) handleResize();

  window.visualViewport?.addEventListener("resize", handleResize);
  window.visualViewport?.addEventListener("scroll", handleResize);

  return {
    unsubscribe() {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    },
  };
}
