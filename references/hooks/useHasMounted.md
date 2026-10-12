# useHasMounted

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useHasMounted.ts`](../../web/packages/hooks/useHasMounted.ts)
**Tests:** [`useHasMounted.test.ts`](../../tests/hooks/useHasMounted.test.ts)

## 목적과 소유권

Returns a boolean indicating whether the component has mounted on the client. A simple hydration guard for preventing server-client content mismatches.

## 동작 계약

Uses `useEffect` to set `true` after mount. Returns `false` on the server and during the first client render before hydration.

## Public API

```ts
function useHasMounted(): boolean;
```

초기 state는 `false`이고 mount effect가 실행되면 `true`로 전환된다. 따라서 SSR과 hydration 전 첫 client render에는 `false`, mount effect가 flush된 뒤에는 `true`를 반환한다.

## 예제

```tsx
import { useHasMounted } from "@musecat/functionkit/web";

function ClientOnly() {
  const mounted = useHasMounted();
  if (!mounted) return <Fallback />;
  return <ClientContent />;
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

mount effect 외 listener, timer, subscription은 없어 별도 cleanup이 없다. 이 hook은 mount 여부만 나타내며 browser capability 존재 여부를 검증하거나 hydration mismatch를 자동으로 해결하지 않는다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useHasMounted.test.ts`](../../tests/hooks/useHasMounted.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
