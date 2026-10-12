# useScrollLock

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`packages/hooks/useScrollLock.ts`](../../web/packages/hooks/useScrollLock.ts)
**Tests:** [`tests/hooks/useScrollLock.test.ts`](../../tests/hooks/useScrollLock.test.ts)

## 목적과 소유권

Locks document and body scrolling while an overlay or other transient surface is active. Multiple
consumers share one lock count, and the original inline overflow/overscroll styles are restored
after the final lock is released.

## Public API

```ts
function useScrollLock(locked?: boolean): {
  lockScroll: () => void;
  openScroll: () => void;
};
```

The effect acquires the lock when `locked` is true and releases it when the value changes or the
component unmounts. The imperative controls are useful for a consumer-owned transition boundary;
each call to `lockScroll` must be paired with `openScroll`.

## Touch behavior and cleanup

While locked, boundary overscroll is prevented on touch gestures. A scrollable ancestor remains
usable; gestures that would overscroll the body are cancelled. Event listeners and inline styles
are removed/restored when the final lock is released.

## Runtime과 dependency

Client-only API다. `document`/`window`가 존재하는 browser lifecycle을 전제로 한다. Server Component에서 직접 실행하거나 반환된 imperative method를 server runtime에서 호출하는 것은 지원 계약이 아니다.

## 동작 계약

`locked=true` effect와 imperative `lockScroll()`은 같은 shared lock count를 획득한다. 첫 lock이 document/body의 원래 inline overflow·overscroll 값을 저장하고 scroll을 막으며, 마지막 release만 원래 값을 복원한다. touch gesture는 실제 scrollable ancestor가 더 이동할 수 있을 때는 허용하고 body boundary overscroll로 빠질 때만 prevent한다.

## 접근성


Hook 자체는 semantic element를 렌더링하지 않는다. consumer가 반환값을 적용하는 UIKit/host control이 role, accessible name과 focusability를 소유한다.

## 오류와 cleanup

첫 lock에서 style snapshot을 항상 생성하고 마지막 release에서만 소비하는 것이 내부 invariant다. lock count가 0으로 돌아오는 경로에서는 snapshot이 존재함을 전제로 정확히 한 번 복원한다.

여러 consumer가 lock을 공유하므로 각 acquire는 반드시 한 번 release되어야 한다. effect는 `locked` 변경/unmount에서 자신이 획득한 lock을 반환하며 마지막 lock이 사라질 때 touch listener와 inline style을 복원한다.

## 예제

```ts
import { useScrollLock } from "@musecat/functionkit/web";
```

정확한 호출 형태는 위 Public API와 source signature를 따른다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`useScrollLock.test.ts`](../../tests/hooks/useScrollLock.test.ts)가 nested lock count, style 복원, touch boundary 처리와 unmount cleanup을 검증한다.
