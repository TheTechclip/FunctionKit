# useDebouncedCallback

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useDebouncedCallback.ts`](../../web/packages/hooks/useDebouncedCallback.ts)
**Tests:** [`useDebouncedCallback.test.ts`](../../tests/hooks/useDebouncedCallback.test.ts)

## 목적과 소유권

Provides a debounced callback for boolean value changes. It debounces the _invocation_ of a callback and automatically cancels a pending change when the value returns to its last committed value.

## 동작 계약

The last committed boolean starts as `false`. With the defaults (`leading: false`, `trailing: true`), a different value is committed after `timeThreshold` ms without a replacement call. Returning to the committed value cancels the pending change. `leading: true` commits immediately; with both edges false no change is delivered. This is a boolean-specific setter, not a generic callback debouncer.

## Public API

```ts
function useDebouncedCallback(options: {
	onChange: (value: boolean) => void;
	timeThreshold: number;
	leading?: boolean;
	trailing?: boolean;
}): (value: boolean) => void;
```

Returns a memoized setter that debounces calls to `onChange`.

## 예제

```tsx check
"use client";

import { useDebouncedCallback } from "@musecat/functionkit/web";

export function ToggleTracker() {
	const handleChange = useDebouncedCallback({
		onChange: (value) => console.log("Toggle settled:", value),
		timeThreshold: 500,
	});

	return <input type="checkbox" aria-label="Track toggle" onChange={(event) => handleChange(event.target.checked)} />;
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

Owns the current debounce timer. Each setter call cancels the previous pending change, and unmount cancels the current timer. Changing threshold or edge options updates future setter calls but does not itself cancel an already pending change. `onChange` errors are not caught; the committed value is recorded only after `onChange` returns.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useDebouncedCallback.test.ts`](../../tests/hooks/useDebouncedCallback.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
