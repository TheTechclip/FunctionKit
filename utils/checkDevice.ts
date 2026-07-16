export type DeviceInfo = {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isIOSSafari: boolean;
  isMacSafari: boolean;
  isSamsungBrowser: boolean;
  isTouchDevice: boolean;
  browser: string;
};

export function getDeviceInfo(): DeviceInfo {
  let isMobile = false;
  let isIOS = false;
  let isAndroid = false;
  let isSafari = false;
  let isIOSSafari = false;
  let isMacSafari = false;
  let isSamsungBrowser = false;
  let isTouchDevice = false;
  let browser = "unknown";

  if (typeof window === "undefined") {
    return {
      isMobile,
      isIOS,
      isAndroid,
      isSafari,
      isIOSSafari,
      isMacSafari,
      isSamsungBrowser,
      isTouchDevice,
      browser,
    };
  }

  const ua = navigator.userAgent;

  isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  isIOS = /iPhone|iPad|iPod/i.test(ua);
  isAndroid = /Android/i.test(ua);
  isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
  isIOSSafari = isIOS && isSafari;
  isMacSafari = /Macintosh/i.test(ua) && isSafari && !isIOS;
  isSamsungBrowser = /SamsungBrowser/i.test(ua);
  isTouchDevice = "ontouchstart" in window;

  if (isSamsungBrowser) {
    browser = "samsung";
  } else if (isSafari) {
    browser = "safari";
  } else if (/Chrome/i.test(ua)) {
    browser = "chrome";
  } else if (/Firefox/i.test(ua)) {
    browser = "firefox";
  } else if (/Edge/i.test(ua)) {
    browser = "edge";
  } else {
    browser = "unknown";
  }

  return {
    isMobile,
    isIOS,
    isAndroid,
    isSafari,
    isIOSSafari,
    isMacSafari,
    isSamsungBrowser,
    isTouchDevice,
    browser,
  };
}
