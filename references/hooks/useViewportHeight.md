# useViewportHeight

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useViewportHeight.ts`](../../web/packages/hooks/useViewportHeight.ts)
**Tests:** [`useViewportHeight.test.ts`](../../tests/hooks/useViewportHeight.test.ts)

## 목적과 소유권

Returns the current viewport height in pixels, reacting to resize events. Uses `visualViewport` when available, falling back to `window.innerHeight`.

## 동작 계약

- Client snapshot은 `visualViewport.height`를 우선하고 `window.innerHeight`로 fallback한다. SSR은 별도 server snapshot `0`을 사용하므로 client snapshot에서 중복 `window` guard를 두지 않는다.

Uses `useSyncExternalStore` and reads `visualViewport.height`, falling back to
`window.innerHeight`. All mounted hook consumers share the same native
`visualViewport.resize` / `window.resize` listener pair, which is detached after
the final subscriber unmounts.

## Public API

```ts
function useViewportHeight(): { height: number };
```

client snapshot은 `window.visualViewport?.height ?? window.innerHeight`이고 server snapshot은 `0`이다. viewport resize notification이 오면 `useSyncExternalStore`가 snapshot을 다시 읽어 `{ height }`를 갱신한다.

## 예제

```tsx
import { useViewportHeight } from "@musecat/functionkit/web";

function FullHeight() {
	const { height } = useViewportHeight();
	return <div style={{ height }}>Content</div>;
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

consumer가 직접 listener를 해제하지 않는다. `useSyncExternalStore` unsubscribe가 shared viewport channel에서 subscriber를 제거하고 마지막 subscriber가 사라지면 native resize listener도 제거한다. SSR에서는 browser global을 읽지 않고 `0` snapshot을 사용한다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useViewportHeight.test.ts`](../../tests/hooks/useViewportHeight.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
