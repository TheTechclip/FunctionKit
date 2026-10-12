# SwitchCase

> 상태: Reference
>
> Runtime: Universal
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`SwitchCase.tsx`](../../web/packages/components/SwitchCase.tsx)
**Tests:** [`SwitchCase.test.tsx`](../../tests/components/SwitchCase.test.tsx)

## 목적과 소유권

A declarative `switch`/`case` component for JSX. Renders the matching `ReactNode` based on a value, with an optional fallback (`otherwise`). Eliminates messy ternary chains and `&&` conditions.

## 동작 계약

Takes a `value` and a `cases` record, then returns the value at that key. The record may contain a broader set of string/number keys than the current value; this makes an explicit fallback type-safe. If no key matches, renders `otherwise` (or `null`).

SSR-safe — pure function with no `"use client"`.

## Public API

```ts
interface SwitchCaseProps<T extends string | number> {
  value: T;
  cases: Partial<Record<string | number, ReactNode>>;
  otherwise?: ReactNode;
}

function SwitchCase<T extends string | number>(props: SwitchCaseProps<T>): ReactNode;
```

## 예제

```tsx
import { SwitchCase } from "@musecat/functionkit/web";

function StatusBadge({ status }: { status: "loading" | "success" | "error" }) {
  return (
    <SwitchCase
      value={status}
      cases={{
        loading: <Spinner />,
        success: <CheckIcon />,
        error: <ErrorIcon />,
      }}
      otherwise={<Fallback />}
    />
  );
}
```

## Import and SSR boundary

Exported from the root barrel. It is SSR-safe and can be used in Server Components, RSC, and Client Components.

## Runtime과 dependency

브라우저 전용 전역에 의존하지 않아 server/client 양쪽에서 사용할 수 있다. `@musecat/functionkit`에 export된 symbol은 DataKit에서도 root entry를 사용한다.

## 접근성


Mapped component는 composed host semantics를 사용한다. 접근성 behavior 변경은 source와 component contract test를 함께 갱신한다.

## 오류와 cleanup

장기 유지되는 browser resource를 직접 소유하지 않는다. throw/null/fallback semantics가 있는 경우 위 동작 계약과 source signature를 따른다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`SwitchCase.test.tsx`](../../tests/components/SwitchCase.test.tsx)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
