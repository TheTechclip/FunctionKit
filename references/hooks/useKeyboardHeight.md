# useKeyboardHeight

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useKeyboardHeight.ts`](../../web/packages/hooks/useKeyboardHeight.ts)
**Tests:** [`useKeyboardHeight.test.ts`](../../tests/hooks/useKeyboardHeight.test.ts)

## 목적과 소유권

Returns the current virtual keyboard height in pixels by subscribing to `visualViewport` changes. Useful for adjusting layout when the keyboard opens on mobile.

## 동작 계약

Internally uses `subscribeKeyboardHeight`, which consumes shared
`visualViewport.resize` and `visualViewport.scroll` channels. Multiple keyboard
height subscribers therefore share the native viewport listeners while keeping
their own callback throttling. Height is the difference between the full
viewport and the visual viewport.

## Public API

```ts
function useKeyboardHeight(): { keyboardHeight: number };
```

Returns the keyboard height in pixels (0 when the keyboard is closed).

## 예제

```tsx check
"use client";

import { useKeyboardHeight } from "@musecat/functionkit/web";

export function ChatLayout() {
	const { keyboardHeight: kbHeight } = useKeyboardHeight();
	return (
		<div style={{ paddingBottom: kbHeight }}>
			<p>Conversation</p>
			<input aria-label="Message" />
		</div>
	);
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

Starts at 0 and subscribes in an effect with an immediate geometry check. Unmount invokes the subscription's unsubscribe, releasing its shared viewport registrations and suppressing subsequent notifications. Without `visualViewport`, height remains 0. A positive viewport-height difference is an estimate, not proof that a keyboard is open; zoom and browser UI can affect it.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useKeyboardHeight.test.ts`](../../tests/hooks/useKeyboardHeight.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
