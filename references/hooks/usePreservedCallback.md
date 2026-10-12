# usePreservedCallback

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`usePreservedCallback.ts`](../../web/packages/hooks/usePreservedCallback.ts)
**Tests:** [`usePreservedCallback.test.ts`](../../tests/hooks/usePreservedCallback.test.ts)

## 목적과 소유권

Returns a stable function identity that delegates to the callback stored by the latest completed synchronization effect. Useful for subscriptions whose lifetime should not depend on callback identity.

## 동작 계약

Stores the latest callback in a `useRef`, then returns a `useCallback`-wrapped proxy that always invokes `ref.current`. The returned function never changes identity, preventing unnecessary re-renders of memoized children.

## Public API

```ts
function usePreservedCallback<
  Arguments extends unknown[] = unknown[],
  ReturnValue = unknown,
>(
  callback: (...args: Arguments) => ReturnValue,
): (...args: Arguments) => ReturnValue;
```

반환 함수의 identity는 mount 동안 유지된다. 호출 인자와 반환값은 현재 `callbackRef.current`에 그대로 전달되며, 새 callback은 effect가 실행될 때 ref에 반영된다.

## 예제

```tsx check
"use client";

import { usePreservedCallback, useIntersectionObserver } from "@musecat/functionkit/web";

export function InfiniteScroll({ onLoadMore }: { onLoadMore: () => void }) {
  const stableLoadMore = usePreservedCallback(onLoadMore);

  const ref = useIntersectionObserver<HTMLDivElement>((entry) => {
    if (entry.isIntersecting) stableLoadMore();
  });

  return <div ref={ref} aria-hidden="true" />;
}
```

## Trade-off

`callbackRef`는 effect에서 동기화되므로 render 직후부터 effect가 flush되기 전까지 반환 proxy는 직전 render의 callback을 가리킬 수 있다. 일반 event/effect callback에서 안정된 identity가 필요할 때 사용하고, render/layout 단계에서 최신 callback을 동기적으로 호출해야 하는 로직에는 dependency가 명시된 `useCallback` 등 다른 소유 모델을 사용한다.

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

effect/ref만 사용하므로 consumer가 수행할 cleanup은 없다. callback이 throw하면 반환 proxy가 예외를 그대로 전파한다. 새 callback은 effect에서 반영되므로 render와 effect flush 사이에 synchronous하게 proxy를 호출하면 직전 callback을 호출할 수 있다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`usePreservedCallback.test.ts`](../../tests/hooks/usePreservedCallback.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
