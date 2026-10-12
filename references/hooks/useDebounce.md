# useDebounce

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useDebounce.ts`](../../web/packages/hooks/useDebounce.ts)
**Tests:** [`useDebounce.test.ts`](../../tests/hooks/useDebounce.test.ts)

## 목적과 소유권

Debounces callback invocations in a Client Component and cancels pending work when the debouncer is replaced or the component unmounts. For the Universal timer utility, see [debounce](../utils/debounce.md).

## 동작 계약

**`useDebounce`**: React hook that returns a stable debounced callback. It defaults to `leading: false` and `trailing: true`, uses the latest callback, and cancels pending timers on unmount. Its boolean options differ from the utility's `edges` array.

## Public API

```ts
// React hook — client-only
function useDebounce<Arguments extends unknown[]>(
	callback: (...args: Arguments) => void,
	wait: number,
	options?: { leading?: boolean; trailing?: boolean },
): { (...args: Arguments): void; cancel(): void };
```

## 예제

```tsx check
"use client";

import { useDebounce } from "@musecat/functionkit/web";

export function SearchInput({ onSearch }: { onSearch: (query: string) => void }) {
	const handleSearch = useDebounce(onSearch, 300);
	return <input aria-label="Search" onChange={(e) => handleSearch(e.target.value)} />;
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

Pending timers are cancelled on unmount and when `wait`, `leading`, or `trailing` changes; `.cancel()` also discards the pending arguments. Callback changes alone do not replace the debouncer, and are reflected after the preserved-callback effect. Negative waits are clamped to 0 by the underlying utility. Callback exceptions are not caught, and requests started by the callback are not aborted.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useDebounce.test.ts`](../../tests/hooks/useDebounce.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
