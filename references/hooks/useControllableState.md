# useControllableState

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`packages/hooks/useControllableState.ts`](../../web/packages/hooks/useControllableState.ts)
**Tests:** [`tests/hooks/useControllableState.test.ts`](../../tests/hooks/useControllableState.test.ts)

## 목적과 소유권

Provides the controlled/uncontrolled state primitive used by reusable React controls. When
`value` is provided, it is returned as the current value and the setter is a no-op. Otherwise the
hook owns internal state initialized from `defaultValue`.

## Public API

```ts
function useControllableState<T>(options: {
	value?: T;
	defaultValue: T;
}): readonly [T, (next: T | ((previous: T) => T)) => void, boolean];
```

The tuple contains the current value, setter, and `isControlled` flag. The consumer owns change
callbacks and external value updates.

## Cleanup and constraints

The hook creates no global listeners or timers. It does not call an `onChange` callback and does
not mutate controlled state; the parent must update `value` in response to its own callback.

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 동작 계약

`value !== undefined`이면 controlled mode이며 반환 current value는 항상 `value`다. 이 mode에서 setter는 내부 state를 변경하지 않는다. `value === undefined`이면 `defaultValue`로 한 번 초기화한 internal state를 setter가 변경한다. 세 번째 tuple 값 `isControlled`가 현재 mode를 명시하며, change callback은 이 hook이 대신 호출하지 않는다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

global listener/timer/subscription을 만들지 않아 cleanup이 없다. controlled consumer는 setter 호출만으로 값이 바뀐다고 가정하지 말고 자신의 callback에서 parent `value`를 갱신해야 한다.

## 예제

```ts
import { useControllableState } from "@musecat/functionkit/web";
```

정확한 호출 형태는 위 Public API와 source signature를 따른다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useControllableState.test.ts`](../../tests/hooks/useControllableState.test.ts)가 controlled/uncontrolled 값 선택, setter 동작과 mode flag를 검증한다.
