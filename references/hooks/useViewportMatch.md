# useViewportMatch

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useViewportMatch.ts`](../../web/packages/hooks/useViewportMatch.ts)
**Tests:** [`useViewportMatch.test.ts`](../../tests/hooks/useViewportMatch.test.ts)

## 목적과 소유권

Returns whether the current viewport matches a CSS media query string. Reactive — updates when the match status changes (e.g., window resize).

## 동작 계약

- SSR은 `useSyncExternalStore` server snapshot `false`를 사용한다. Client store는 `matchMedia` capability만 검사하며 server/runtime 여부를 다시 판별하지 않는다.

Uses `window.matchMedia` with `useSyncExternalStore`. Mounted consumers of the
same query share one cached `MediaQueryList` and one native `change` listener;
the listener is released when the final subscriber unmounts.

## SSR and hydration

The server snapshot returns `false`, preventing hydration mismatches. After the
client store subscribes, React synchronizes the current `matchMedia` snapshot.
It cannot change HTML painted before the client bundle loads; use CSS media
queries for purely visual responsive layout.

## Public API

```ts
function useViewportMatch(query: string): boolean;
```

| Parameter | Type     | Example                                                  |
| --------- | -------- | -------------------------------------------------------- |
| `query`   | `string` | `"(min-width: 768px)"`, `"(prefers-color-scheme: dark)"` |

## 예제

```tsx check
"use client";

import { useViewportMatch } from "@musecat/functionkit/web";

export function ResponsiveComponent() {
	const isDesktop = useViewportMatch("(min-width: 1024px)");
	const isDark = useViewportMatch("(prefers-color-scheme: dark)");

	return <div data-dark={isDark || undefined}>{isDesktop ? "Desktop" : "Mobile"}</div>;
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

Changing the query or unmounting releases the previous subscription; the final subscriber removes the native `change` listener and cached store. Missing `window.matchMedia` yields `false`. Invalid queries follow native `matchMedia` behavior; errors from that API are not caught. The server snapshot is always `false`, not a server-side media-query evaluation.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useViewportMatch.test.ts`](../../tests/hooks/useViewportMatch.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
