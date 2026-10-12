# usePreservedReference

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`usePreservedReference.ts`](../../web/packages/hooks/usePreservedReference.ts)
**Tests:** [`usePreservedReference.test.ts`](../../tests/hooks/usePreservedReference.test.ts)

## 목적과 소유권

Maintains a stable reference to a value, only updating it when the value meaningfully changes. Avoids unnecessary re-renders caused by new object/array identities on every render.

## 동작 계약

Compares the current and previous values using a custom comparator (defaults to `JSON.stringify`). If they are considered equal, the previous reference is returned instead of the new one.

## Public API

```ts
function usePreservedReference<T>(
  value: T,
  areValuesEqual?: (previous: T, next: T) => boolean,
): T;
```

첫 render에서는 전달된 `value`를 그대로 보존한다. 이후 comparator가 `true`를 반환하면 이전 reference를 그대로 반환하고, `false`이면 내부 ref를 현재 `value`로 교체해 그 reference를 반환한다. comparator를 생략하면 `JSON.stringify(previous) === JSON.stringify(next)`를 사용한다.

## 예제

```tsx
import { usePreservedReference } from "@musecat/functionkit/web";

function Filters({ filters }: { filters: { sort: string; page: number } }) {
  const stableFilters = usePreservedReference(filters);

  useEffect(() => {
    fetchResults(stableFilters);
  }, [stableFilters]); // Only fires when actual values change

  return <div>...</div>;
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

별도 browser resource나 effect cleanup은 없다. 기본 comparator가 `JSON.stringify`를 사용하므로 cyclic object나 `BigInt`처럼 stringify가 실패하는 값은 비교 중 예외가 전파될 수 있다. 그런 값을 보존하려면 해당 data shape에 맞는 `areValuesEqual`을 명시한다. custom comparator의 예외도 잡지 않는다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`usePreservedReference.test.ts`](../../tests/hooks/usePreservedReference.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
