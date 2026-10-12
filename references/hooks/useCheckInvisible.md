# useCheckInvisible

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useCheckInvisible.ts`](../../web/packages/hooks/useCheckInvisible.ts)
**Tests:** [`useCheckInvisible.test.ts`](../../tests/hooks/useCheckInvisible.test.ts)

## 목적과 소유권

Detects whether an element with a given CSS class name has scrolled above the viewport (`top < 0`). Useful for triggering "sticky" or "collapsed" states when a section scrolls out of view.

## 동작 계약

- Client snapshot은 DOM query/geometry만 수행하고, SSR은 `useSyncExternalStore`의 별도 server snapshot(`false`)이 담당한다.

Checks the first element matching the provided class name through an external
store snapshot. Scroll and resize invalidation use FunctionKit's shared browser
event channels, so hook instances do not attach independent global listeners.
`isInvisible` is `true` when the element's top edge is above the viewport.

## Public API

```ts
function useCheckInvisible(className: string): { isInvisible: boolean };
```

| Parameter   | Type     | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `className` | `string` | CSS class name of the element to monitor |

Returns `{ isInvisible: boolean }` — `true` means the first matching element's top edge is above the viewport, even if the rest of the element remains visible. It is not a full visibility test.

## 예제

```tsx
"use client";

import { useCheckInvisible } from "@musecat/functionkit/web";

function Header() {
	const { isInvisible } = useCheckInvisible("hero-section");
	return <header className={isInvisible ? "sticky" : ""}>...</header>;
}
```

## Import and SSR boundary

Exported from the root barrel. Client-only (`"use client"`): call it only from a Client Component.

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

Unmount releases both shared scroll and resize subscriptions. A missing matching element yields `false`, as does the server snapshot. Supply a class token without a leading dot; it is escaped with `CSS.escape` before querying. Layout changes without a scroll/resize event do not independently invalidate this snapshot. DOM/CSS API exceptions are not caught.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useCheckInvisible.test.ts`](../../tests/hooks/useCheckInvisible.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
