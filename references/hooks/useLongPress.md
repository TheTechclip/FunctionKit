# useLongPress

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`useLongPress.ts`](../../web/packages/hooks/useLongPress.ts)
**Tests:** [`useLongPress.test.ts`](../../tests/hooks/useLongPress.test.ts)

## 목적과 소유권

Detects a long press gesture on an element. Fires `onLongPress` after the user presses and holds for a configurable delay, with optional `onClick` for tap and `onLongPressEnd` for release.

## 동작 계약

Tracks both mouse and touch events. On `mousedown`/`touchstart`, starts a timer. If the pointer moves beyond `moveThreshold` pixels, the gesture is cancelled. If the timer expires without cancellation, `onLongPress` fires. On release, `onLongPressEnd` fires (if it was a long press), or `onClick` fires (if it was a short tap).

## Public API

```ts
function useLongPress(
	onLongPress: (e: MouseEvent | TouchEvent) => void,
	options?: {
		delay?: number;
		moveThreshold?: { x?: number; y?: number };
		onClick?: (e: MouseEvent | TouchEvent) => void;
		onLongPressEnd?: (e: MouseEvent | TouchEvent) => void;
	},
): {
	onMouseDown: (e: React.MouseEvent) => void;
	onTouchStart: (e: React.TouchEvent) => void;
	onMouseUp: (e: React.MouseEvent) => void;
	onTouchEnd: (e: React.TouchEvent) => void;
	onMouseMove: (e: React.MouseEvent) => void;
	onTouchMove: (e: React.TouchEvent) => void;
	onTouchCancel: (e: React.TouchEvent) => void;
};
```

## 예제

```tsx
import { useLongPress } from "@musecat/functionkit/web";

function LongPressButton() {
	const handlers = useLongPress(() => console.log("hold complete"), {
		onClick: () => console.log("tap"),
		onLongPressEnd: () => console.log("released"),
	});

	return <button {...handlers}>Press & hold</button>;
}
```

Pending timers are cancelled on unmount, pointer cancellation, and mouse leave.

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

장기 유지되는 browser resource를 직접 소유하지 않는다. throw/null/fallback semantics가 있는 경우 위 동작 계약과 source signature를 따른다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useLongPress.test.ts`](../../tests/hooks/useLongPress.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
