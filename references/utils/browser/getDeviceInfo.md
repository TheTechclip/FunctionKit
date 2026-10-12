# getDeviceInfo

> 상태: Reference
>
> Runtime: Guarded browser fallback
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`getDeviceInfo.ts`](../../../web/packages/utils/browser/getDeviceInfo.ts)
**Tests:** [`checkDevice.test.ts`](../../../tests/utils/checkDevice.test.ts)

## 목적과 소유권

Parses the User-Agent string to detect the user's device type, operating system, and browser. Callable at module scope — no `window` required.

## 동작 계약

When `window` exists, analyzes `navigator.userAgent` with a series of regex checks and returns a `DeviceInfo` object with boolean flags. Without `window`, it returns the all-false `unknown` fallback, so it is import-safe but not a browser-equivalent Universal result.

## Public API

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
  browser: string;
}

function getDeviceInfo(): DeviceInfo;
```

## 예제

```tsx
import { getDeviceInfo } from "@musecat/functionkit/web";

const { isMobile, isIOS, isIOSSafari } = getDeviceInfo();

// Call at module scope
const platform = isIOS ? "ios" : isAndroid ? "android" : "web";

export function detectBrowser() {
  const { isSafari, browser } = getDeviceInfo();
  return { isSafari, browser };
}
```

## Runtime과 dependency

모듈 import는 server에서도 안전하지만 browser capability가 없을 때 명시된 fallback을 반환한다. server 결과를 browser detection으로 해석하지 않는다.

## 접근성

해당 없음 — 이 reference의 API는 독립적인 interactive semantic surface를 직접 렌더링하지 않는다.

## 오류와 cleanup

장기 유지되는 browser resource를 직접 소유하지 않는다. throw/null/fallback semantics가 있는 경우 위 동작 계약과 source signature를 따른다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`checkDevice.test.ts`](../../../tests/utils/checkDevice.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
