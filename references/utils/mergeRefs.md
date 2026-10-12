# mergeRefs

> 상태: Reference
>
> Runtime: Universal
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`mergeRefs.ts`](../../web/packages/utils/mergeRefs.ts)
**Tests:** [`mergeRefs.test.ts`](../../tests/utils/mergeRefs.test.ts)

## 목적과 소유권

Combines multiple React refs (callback refs and/or object refs) into a single callback ref. Useful when forwarding refs from parent components while keeping internal refs.

## 동작 계약

Returns a callback ref that attaches object and callback refs in input order and returns an aggregate React 19 cleanup. Null and undefined refs are skipped.

## Public API

```ts
function mergeRefs<T>(...refs: Array<React.Ref<T> | null | undefined>): React.RefCallback<T>;
```

Each attachment owns an idempotent cleanup. A callback's returned cleanup is used instead of calling that callback with null; legacy callbacks receive null on detach. Object refs are cleared only if they still hold the attached value. Calling the merged ref with null detaches its current attachment; without an attachment it does nothing. Reattaching first detaches the previous value. Nested merged refs propagate their aggregate cleanups, and invoking an old cleanup cannot detach a newer attachment.

## 예제

```tsx
import { mergeRefs } from "@musecat/functionkit/web";
import { forwardRef, useRef } from "react";

const Input = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const internalRef = useRef<HTMLInputElement>(null);
  return <input ref={mergeRefs(ref, internalRef)} {...props} />;
});
```

## Runtime과 dependency

브라우저 전용 전역에 의존하지 않아 server/client 양쪽에서 사용할 수 있다. `@musecat/functionkit`에 export된 symbol은 DataKit에서도 root entry를 사용한다.

## 접근성

해당 없음 — 이 reference의 API는 독립적인 interactive semantic surface를 직접 렌더링하지 않는다.

## 오류와 cleanup

For example, a callback can register `node.addEventListener("click", onClick)` and return `() => node.removeEventListener("click", onClick)`; React invokes that cleanup through the merged ref on replacement or unmount. Do not also expect a null call for that callback. Callback errors propagate to the caller/React and stop the remaining attach or cleanup fan-out; consumers own recovery for resources created before an error.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`mergeRefs.test.ts`](../../tests/utils/mergeRefs.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
