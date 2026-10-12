# useInterval

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useInterval.ts`](../../web/packages/hooks/useInterval.ts)
**Tests:** [`useInterval.test.ts`](../../tests/hooks/useInterval.test.ts)

## 목적과 소유권

A `setInterval` wrapper hook with effect-owned cleanup and an `enabled` option for repeated execution.

## 동작 계약

Starts an interval after mount unless `enabled: false`. Pass either a numeric delay or an options object as the second argument; `null` and a third argument are not supported. Changing `delay` or `enabled` clears the old interval. `immediate: true` invokes the callback once when first enabled, before interval ticks. Disabling and re-enabling does not repeat that immediate call; setting `immediate` to false resets its latch.

## Public API

```ts
function useInterval(
	callback: () => void,
	options: number | {
		delay: number;
		immediate?: boolean;
		enabled?: boolean;
	},
): void;
```

## 예제

```tsx check
"use client";

import { useInterval } from "@musecat/functionkit/web";
import { useState } from "react";

export function TickCounter({ enabled = true }: { enabled?: boolean }) {
	const [ticks, setTicks] = useState(0);
	useInterval(() => setTicks((value) => value + 1), {
		delay: 1000,
		immediate: true,
		enabled,
	});

	return <output>{ticks}</output>;
}
```

## Trade-off

Uses `usePreservedCallback`, so a new closure is reflected after its synchronization effect. The interval is not restarted solely because the callback identity changes. Timer callbacks can run before a pending effect flush; do not rely on synchronous latest-render semantics.

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

Clears its interval on disable, delay change, and unmount. The hook does not catch callback errors, await promises, cancel in-flight requests, or prevent overlapping asynchronous work. Polling consumers own request cancellation and error handling. Delay values are passed directly to the host timer without validation.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useInterval.test.ts`](../../tests/hooks/useInterval.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
