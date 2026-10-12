# useToggleState

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useToggleState.ts`](../../web/packages/hooks/useToggleState.ts)
**Tests:** [`useToggleState.test.ts`](../../tests/hooks/useToggleState.test.ts)

## 목적과 소유권

Simplifies boolean state management with explicit `setTrue`, `setFalse`, and `toggle` setters. A more expressive alternative to raw `useState(false)`.

## 동작 계약

Wraps `useState<boolean>` with named setter functions. Accepts an optional initial value (default `false`).

## Public API

```ts
import type { Dispatch, SetStateAction } from "react";

function useToggleState(
  initialValue?: boolean
): {
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
};
```

## 예제

```tsx check
"use client";

import { useToggleState } from "@musecat/functionkit/web";

export function Collapsible({ children }: { children: React.ReactNode }) {
  const { value: isOpen, toggle } = useToggleState(false);

  return (
    <div>
      <button type="button" aria-expanded={isOpen} onClick={toggle}>{isOpen ? "Hide" : "Show"}</button>
      {isOpen && children}
    </div>
  );
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

Uses React state only; there are no listeners or timers to release. `initialValue` is a boolean read on initialization, not a controlled value or lazy-initializer API. `setValue` also accepts a functional updater; errors from caller-provided updater functions follow React's error handling.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useToggleState.test.ts`](../../tests/hooks/useToggleState.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
