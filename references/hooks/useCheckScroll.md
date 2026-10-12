# useCheckScroll

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useCheckScroll.ts`](../../web/packages/hooks/useCheckScroll.ts)
**Tests:** [`useCheckScroll.test.ts`](../../tests/hooks/useCheckScroll.test.ts)

## 목적과 소유권

Detects whether the page has been scrolled vertically (`window.scrollY > 0`). Returns an `isScrolled` flag for toggling UI states such as sticky header shadows or floating action buttons.

## 동작 계약

- Client snapshot은 `window.scrollY > 0`만 읽고, SSR은 `useSyncExternalStore`의 별도 server snapshot(`false`)이 담당한다. client snapshot에서 중복 `typeof window` guard를 두지 않는다.

Reads `window.scrollY > 0` through `useSyncExternalStore`. Hook instances share
one native window `scroll` subscription and fan out updates internally.

## Public API

```ts
function useCheckScroll(): { isScrolled: boolean };
```

Returns `{ isScrolled: boolean }` — `isScrolled` is `true` when `window.scrollY > 0`.

## 예제

```tsx
"use client";

import { useCheckScroll } from "@musecat/functionkit/web";

function StickyHeader() {
	const { isScrolled } = useCheckScroll();
	return <header className={isScrolled ? "header--scrolled" : "header--top"}>...</header>;
}
```

## Import and SSR boundary

Exported from the root barrel. Client-only (`"use client"`): call it only from a Client Component.

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

React releases the hook's shared window-scroll subscription on unmount; the shared channel removes the native listener when no subscribers remain. The server snapshot is `false`. This hook reports only `window.scrollY > 0`; it does not track element scrolling, scroll direction, or available scroll range.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useCheckScroll.test.ts`](../../tests/hooks/useCheckScroll.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
