# useTimeout

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useTimeout.ts`](../../web/packages/hooks/useTimeout.ts)
**Tests:** [`useTimeout.test.ts`](../../tests/hooks/useTimeout.test.ts)

## 목적과 소유권

A `setTimeout` wrapper with imperative `start`, `reset`, `clear`, and `isPending()` controls.

## 동작 계약

Schedules after mount unless `enabled: false`. `start` and its alias `reset` replace any pending timer, optionally overriding the delay for that call. The default delay is 0. Changing delay or enabled status cleans up the effect-owned timer. `enabled: false` prevents automatic scheduling, not explicit calls to `start` or `reset`. `isPending()` reads a ref; it is not reactive state and timer completion does not cause a render.

## Public API

```ts
interface UseTimeoutControls {
	start: (overrideDelay?: number) => void;
	reset: (overrideDelay?: number) => void;
	clear: () => void;
	isPending: () => boolean;
}

function useTimeout(
	callback: () => void,
	delay?: number,
	options?: { enabled?: boolean },
): UseTimeoutControls;
```

## 예제

```tsx check
"use client";

import { useTimeout } from "@musecat/functionkit/web";

export function DelayedAction({ onRun }: { onRun: () => void }) {
	const { reset, clear, isPending } = useTimeout(onRun, 5000, { enabled: false });

	return (
		<div>
			<button type="button" onClick={() => reset(1000)}>Run in one second</button>
			<button type="button" onClick={() => {
				if (isPending()) clear();
			}}>Cancel</button>
		</div>
	);
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

Owns one timeout and clears it on replacement, effect cleanup, and unmount, including manually started timers. It marks the timer no longer pending before invoking the callback. Callback errors propagate; promises or other work started by the callback are not cancelled. Wrap event handlers as `() => reset()` rather than passing an event to the numeric override argument.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useTimeout.test.ts`](../../tests/hooks/useTimeout.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
