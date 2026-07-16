# getDeviceInfo (checkDevice)

## Purpose

Parses the User-Agent string to detect the user's device type, operating system, and browser. Callable at module scope — no `window` required.

## Usage Logic

Analyzes `navigator.userAgent` with a series of regex checks. Returns a `DeviceInfo` object with boolean flags. SSR-safe — can be called in Server Components, RSC, or module initialization.

## Type Signatures

```ts
interface DeviceInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isIOSSafari: boolean;
  isMacSafari: boolean;
  isSamsungBrowser: boolean;
  isTouchDevice: boolean;
  browser: string | null;
}

function getDeviceInfo(): DeviceInfo;
```

## Example Code

```tsx
import { getDeviceInfo } from "@musecat/functionkit";

const { isMobile, isIOS, isIOSSafari } = getDeviceInfo();

// Call at module scope
const platform = isIOS ? "ios" : isAndroid ? "android" : "web";

export function detectBrowser() {
  const { isSafari, browser } = getDeviceInfo();
  return { isSafari, browser };
}
```
