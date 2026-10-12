# escape dismissal

> 상태: Reference
>
> Runtime: Universal
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`packages/utils/escapeDismissal.ts`](../../web/packages/utils/escapeDismissal.ts)
**Tests:** [`tests/utils/escapeDismissal.test.ts`](../../tests/utils/escapeDismissal.test.ts)

## 목적과 소유권

Provides a small shared blocker for interactions that must temporarily prevent an overlay from
handling Escape dismissal, such as an active drag or another higher-priority gesture.

## Public API

```ts
function acquireEscapeDismissalBlock(): () => void;
function isEscapeDismissalBlocked(): boolean;
```

Acquisition increments a nested counter and returns an idempotent release function. Escape is
blocked while at least one acquisition is active.

## Ownership

This utility does not listen for keyboard events or close any surface. The overlay or gesture owner
continues to own event handling and must release its token on every completion and cancellation path.

## Runtime과 dependency

브라우저 전용 전역에 의존하지 않아 server/client 양쪽에서 사용할 수 있다. `@musecat/functionkit`에 export된 symbol은 DataKit에서도 root entry를 사용한다.

## 동작 계약

`acquireEscapeDismissalBlock()`은 module-level nested counter를 증가시키고 한 번만 효력이 있는 release 함수를 반환한다. 하나 이상의 block이 남아 있는 동안 `isEscapeDismissalBlocked()`가 `true`이며 마지막 release 뒤 `false`가 된다. 이 utility 자체는 Escape listener를 등록하거나 overlay를 닫지 않는다.

## 접근성

해당 없음 — 이 reference의 API는 독립적인 interactive semantic surface를 직접 렌더링하지 않는다.

## 오류와 cleanup

획득 함수는 외부 resource를 만들지 않는다. 반환된 release는 idempotent하므로 중복 호출로 counter가 음수가 되지 않지만, gesture/overlay owner는 success·cancel·unmount 모든 종료 경로에서 release해야 한다.

## 예제

```ts
import { acquireEscapeDismissalBlock, isEscapeDismissalBlocked } from "@musecat/functionkit/web";
```

정확한 호출 형태는 위 Public API와 source signature를 따른다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`escapeDismissal.test.ts`](../../tests/utils/escapeDismissal.test.ts)가 nested acquisition, release 순서와 idempotent cleanup을 검증한다. package typecheck와 public export test도 함께 유지한다.
