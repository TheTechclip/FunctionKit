# useIntersectionObserver

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useIntersectionObserver.ts`](../../web/packages/hooks/useIntersectionObserver.ts)
**Tests:** [`useIntersectionObserver.test.ts`](../../tests/hooks/useIntersectionObserver.test.ts)

## 목적과 소유권

Provides a convenient ref callback pattern for `IntersectionObserver`. Calls a callback when the observed element's intersection status changes.

## 동작 계약

Attaches the observer when the ref receives an element and cleans it up when the element or hook unmounts. Accepts standard `IntersectionObserverInit` options. Hooks with the same root and option values share one native observer while keeping independent callbacks. The callback is stabilized with `usePreservedCallback`.

## Public API

```ts
function useIntersectionObserver<Element extends HTMLElement>(
	callback: (entry: IntersectionObserverEntry) => void,
	options?: IntersectionObserverInit,
): (element: Element | null) => void;
```

Returns a callback ref to assign to the target element.

## 예제

```tsx check
"use client";

import { useIntersectionObserver } from "@musecat/functionkit/web";

export function VisibilitySentinel({ onVisible }: { onVisible: () => void }) {
	const ref = useIntersectionObserver<HTMLDivElement>(
		(entry) => {
			if (entry.isIntersecting) onVisible();
		},
		{ threshold: 0.1 },
	);

	return <div ref={ref} aria-hidden="true" />;
}
```

## Trade-off

Option values are compared by a serialized key, so an inline object with the same values can still share the native observer. Use stable DOM roots and standard serializable `IntersectionObserverInit` values.

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

등록 cleanup은 해당 element의 registration set이 존재하는 동안 정확히 한 번 소비되는 내부 invariant를 따른다. 동일 element를 여러 consumer가 공유하면 마지막 registration이 해제될 때만 `unobserve`, bucket의 마지막 element가 사라질 때만 `disconnect`한다.

The callback receives one entry, not the browser API's entries array. Missing `IntersectionObserver` makes attachment a no-op, without a synthetic visible entry. Invalid native observer options and callback exceptions are not caught. Callers that need a fallback or once-only loading must implement those policies themselves.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useIntersectionObserver.test.ts`](../../tests/hooks/useIntersectionObserver.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
