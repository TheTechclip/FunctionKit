# useRefEffect

The latest setup is synchronized in React's insertion effect, before layout-phase
ref attachment. It never writes the setup ref during rendering or waits for a
passive effect; an abandoned concurrent render cannot replace the committed setup.
Changing `deps` reattaches immediately with that commit's callback. A new DOM node
also uses the latest committed callback even when `deps` are unchanged.

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useRefEffect.ts`](../../web/packages/hooks/useRefEffect.ts)
**Tests:** [`useRefEffect.test.ts`](../../tests/hooks/useRefEffect.test.ts)

## 목적과 소유권

Provides a ref callback that runs an effect when the element mounts and optionally runs a cleanup when it unmounts or when dependencies change. Similar to `useEffect` but keyed to a DOM element's lifecycle.

## 동작 계약

Returns a callback ref whose identity is controlled by the required dependency list. Attachment runs the current render's callback synchronously in the ref commit, without waiting for passive effects. Changing dependencies makes React detach the old ref and attach the new one, cleaning up before rerunning on the same element. Changing only the callback does not rerun an existing attachment, but the next attachment uses the current callback. Null detaches and clears the stored cleanup; replacing the element also cleans up first.

## Public API

```ts
type CleanupCallback = () => void;

function useRefEffect<RefElement extends HTMLElement = HTMLElement>(
	effect: (el: RefElement) => CleanupCallback | void,
	deps: DependencyList,
): (el: RefElement | null) => void;
```

## 예제

```tsx
import { useRefEffect } from "@musecat/functionkit/web";

function AutoFocus() {
	const ref = useRefEffect((el) => {
		el.focus();
		return () => console.log("unmounted");
	}, []);

	return <input ref={ref} />;
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

Return cleanup for resources created by the callback: for example, create a `ResizeObserver`, call `observe(el)`, and return `() => observer.disconnect()`. Cleanup runs on ref detach, dependency changes, or node replacement; repeated null calls do not repeat successful cleanup. If the callback returns nothing, no resource cleanup is stored. Callback and cleanup errors propagate to React/the caller rather than being swallowed.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useRefEffect.test.ts`](../../tests/hooks/useRefEffect.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
