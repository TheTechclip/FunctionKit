# memoryHistory

> 상태: Reference
>
> Runtime: Universal
>
> Public surface: `@musecat/functionkit/web` (`@musecat/functionkit`은 호환 alias)

**Source:** [`memoryHistory.ts`](../../web/packages/utils/memoryHistory.ts)
**Tests:** [`memoryHistory.test.ts`](../../tests/utils/memoryHistory.test.ts), [`index.test.ts`](../../tests/index.test.ts)

## 목적과 소유권

브라우저 history를 소유할 수 없는 feature/framework를 위한 framework-neutral in-memory navigation stack이다. stack, position, navigation direction/revision과 subscription만 소유하며 URL serialization, browser history, UI transition, confirmation policy는 소유하지 않는다.

## Public API

`MemoryHistory`, `MemoryHistoryDirection`, `MemoryHistoryNavigation`, `createMemoryHistory`를 shared surface에서 공개한다. 생성된 history는 `read`, `push`, `replace`, `reset`, `back`, `go`, `subscribe`, `getStack`, `getNavigation`을 제공한다.

## Runtime과 dependency

React/DOM/browser API가 없는 pure state container라 server/client에서 사용할 수 있다. instance별 mutable state이며 module-global singleton을 만들지 않는다.

## 동작 계약

- 최초 stack은 `initial` 하나, position `0`, direction `none`, revision `0`이다.
- `push`는 현재 position 뒤의 stale forward branch를 잘라낸 뒤 새 entry를 추가하고 direction을 `forward`로 기록한다.
- `replace`는 현재 entry만 교체하고 direction을 `none`으로 기록한다.
- `reset`은 stack을 하나로 되돌리고 position `0`, direction `none`으로 기록한다.
- `go(delta)`는 `Math.trunc`한 delta를 stack bounds로 clamp하고 실제 position이 바뀌지 않으면 아무 event/revision도 만들지 않는다.
- effective update/navigation마다 revision이 1 증가하고 subscriber에 동기적으로 알린다.
- `subscribe`가 반환하는 함수로 listener를 제거한다.

## 접근성

해당 없음 — navigation state만 제공하며 focus/ARIA/keyboard policy는 이를 소비하는 UI owner가 결정한다.

## 오류와 cleanup

범위 밖 `go`는 throw하지 않고 boundary에서 no-op이다. 외부 resource는 없지만 장기 subscriber는 반환된 unsubscribe를 호출해야 한다.

## 예제

```ts
import { createMemoryHistory } from "@musecat/functionkit";

const history = createMemoryHistory({ step: "list" });
history.push({ step: "details" });
history.back();
const current = history.read();
```

## 금지 패턴

- browser back/forward를 실제로 소유해야 하는 route에 이 memory stack을 대신 사용하지 않는다.
- `getStack()` 결과를 mutate해 internal state를 우회하지 않는다.
- subscription을 React lifecycle 밖에서 무기한 유지하지 않는다.

## 검증

`memoryHistory.test.ts`가 push/back, forward-branch truncation, direction/revision/position과 subscription을 검증하며 `index.test.ts`가 public export를 검증한다.
