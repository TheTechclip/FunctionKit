# useDoubleClick

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useDoubleClick.ts`](../../web/packages/hooks/useDoubleClick.ts)
**Tests:** [`useDoubleClick.test.ts`](../../tests/hooks/useDoubleClick.test.ts)

## 목적과 소유권

Delays single-click work and dispatches double-click work from a React mouse event's native click count (`event.detail`).

## 동작 계약

Every event clears the pending single-click timer. `detail === 1` schedules the optional `click` callback after `delay` milliseconds (default 250); `detail === 2` calls the required `doubleClick` callback immediately. Other click counts perform no callback. The browser determines the click count; `delay` does not configure its double-click threshold. Callbacks receive the original event and use the latest handlers supplied to the hook.

## Public API

```ts
import type { MouseEvent } from "react";

function useDoubleClick<E extends HTMLElement = HTMLElement>(
	options: {
		delay?: number;
		click?: (event: MouseEvent<E>) => void;
		doubleClick: (event: MouseEvent<E>) => void;
	},
): (event: MouseEvent<E>) => void;
```

Returns the handler itself, not an object. Assign it to `onClick`.

## 예제

```tsx check
"use client";

import { useDoubleClick } from "@musecat/functionkit/web";

export function FileButton() {
	const onClick = useDoubleClick<HTMLButtonElement>({
		delay: 300,
		click: () => console.log("select"),
		doubleClick: () => console.log("open"),
	});

	return <button type="button" onClick={onClick}>Select file</button>;
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Keyboard activation commonly has `detail === 0`, so this hook alone does not implement keyboard activation. Provide a normal keyboard-accessible action for every operation, especially the double-click action.

## 오류와 cleanup

Owns at most one single-click timeout. A subsequent event or unmount clears it. Callback exceptions are not caught. A delayed callback should not depend on `event.currentTarget` still being populated; capture needed values in the event handler instead.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useDoubleClick.test.ts`](../../tests/hooks/useDoubleClick.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
