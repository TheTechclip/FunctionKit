# subscribeKeyboardHeight

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`subscribeKeyboardHeight.ts`](../../../web/packages/utils/browser/subscribeKeyboardHeight.ts)
**Tests:** [`subscribeKeyboardHeight.test.ts`](../../../tests/utils/subscribeKeyboardHeight.test.ts)

## 목적과 소유권

A low-level utility that subscribes to `visualViewport` resize/scroll events and reports the estimated keyboard height. Used internally by `useKeyboardHeight`.

## 동작 계약

Shares `resize` and `scroll` listeners on `window.visualViewport`. Computes `max(0, window.innerHeight - visualViewport.height)`. With a positive throttle (default 16ms), each pending interval delivers the latest observed height, including the final keyboard-close value `0`, rather than its first event. Nonpositive throttle is synchronous. Only changed heights are reported; the initial remembered height is `0`. `immediate: true` measures on subscription but still follows the throttle. Missing visualViewport produces no notification.

## Public API

```ts
function subscribeKeyboardHeight(
	options: {
		callback: (height: number) => void;
		immediate?: boolean;
		throttleMs?: number;
	},
): { unsubscribe: () => void };
```

## 예제

```tsx
"use client";

import { subscribeKeyboardHeight } from "@musecat/functionkit/web";
import { useEffect } from "react";

function useCustomKeyboardHandler() {
	useEffect(() => {
		const { unsubscribe } = subscribeKeyboardHeight({
			callback: (height) => console.log("Keyboard height:", height),
			immediate: true,
			throttleMs: 100,
		});
		return unsubscribe;
	}, []);
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성

해당 없음 — 이 reference의 API는 독립적인 interactive semantic surface를 직접 렌더링하지 않는다.

## 오류와 cleanup

Each subscription owns its pending timeout and two shared-event registrations. The caller must unsubscribe (for example on effect cleanup). Unsubscribe is idempotent, cancels the pending timeout, releases both registrations, and prevents notifications even if the registration was already included in an in-flight event snapshot. The last registration releases the native listener.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`subscribeKeyboardHeight.test.ts`](../../../tests/utils/subscribeKeyboardHeight.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
