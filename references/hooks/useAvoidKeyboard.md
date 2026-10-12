# useAvoidKeyboard

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useAvoidKeyboard.ts`](../../web/packages/hooks/useAvoidKeyboard.ts)
**Tests:** [`useAvoidKeyboard.test.ts`](../../tests/hooks/useAvoidKeyboard.test.ts)

## 목적과 소유권

Returns a style object that pushes the bottom of the viewport upward via `translateY` when the virtual keyboard appears. Useful for fixing mobile layout issues where the keyboard overlaps input fields.

## 동작 계약

Uses `useKeyboardHeight`. A positive measured height sets `translateY(-height)`; otherwise `safeAreaBottom` is used. The hook only returns styles for the caller's element: it does not move the viewport, scroll a focused input, or measure overlap.

## Public API

```ts
type UseAvoidKeyboardOptions = {
  safeAreaBottom?: number;
  transitionDuration?: number;
  transitionTimingFunction?: string;
};

function useAvoidKeyboard(options?: UseAvoidKeyboardOptions): { style: React.CSSProperties };
```

Returns `transform` (undefined for a nonpositive offset) and `transition`. Defaults: `safeAreaBottom: 0`, `transitionDuration: 200` milliseconds, `transitionTimingFunction: "ease-out"`. It does not return `willChange`.

## 예제

```tsx check
"use client";

import { useAvoidKeyboard } from "@musecat/functionkit/web";

export function ChatInput() {
	const { style: keyboardStyle } = useAvoidKeyboard();
	return <div style={keyboardStyle}><input aria-label="Message" /></div>;
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

The nested keyboard-height hook releases its viewport subscriptions on unmount. No separate DOM mutation or listener is installed by this hook. If keyboard geometry is unavailable, its measured height stays 0 and `safeAreaBottom` still applies. Style values are not validated, and assigning the returned style replaces any existing transform/transition on the element.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useAvoidKeyboard.test.ts`](../../tests/hooks/useAvoidKeyboard.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
