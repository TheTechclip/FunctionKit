# Shared browser events

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`sharedBrowserEvents.ts`](../../../web/packages/utils/browser/sharedBrowserEvents.ts)
**Tests:** [`sharedBrowserEvents.test.ts`](../../../tests/utils/sharedBrowserEvents.test.ts)

## 목적과 소유권

Window와 `visualViewport`의 resize/scroll처럼 여러 UI subsystem이 동시에 구독하는 browser event를 하나의 native listener channel로 multiplex한다. UIKit 같은 Web consumer는 자체 global event registry를 만들지 않고 이 API를 사용한다.

## 동작 계약

- 같은 target/event/capture 조합의 구독자는 native `addEventListener` 하나를 공유하고 마지막 구독자가 해제될 때만 제거한다.
- Each call owns a unique registration, even when callbacks are identical. Unsubscribing one owner does not remove another owner or a later subscription of the same callback.
- Dispatch snapshots registrations before invoking callbacks: changes made during a callback apply to the next event. A registration removed during dispatch still receives the current event; a newly added registration does not.
- callback은 실제 `Event`를 받는다. `window` scroll의 capture/bubble 채널은 별개이며 제거할 때도 동일한 capture option을 사용한다.
- `visualViewport` 또는 `window` object가 교체되면 기존 native listener를 이전 target에서 제거하고 새 target으로 channel을 재생성한다. browser target이 없으면 해제 가능한 no-op을 반환한다.
- `subscribeViewportResize`는 window resize와 visual viewport resize를 결합한다. `subscribeViewportScroll`은 visual viewport scroll을 기본으로 구독하며 필요할 때 window scroll/capture를 추가한다.
- `subscribeViewportGeometry`는 resize와 visual viewport scroll을 항상 포함하고, option으로 window scroll/capture와 orientation change를 추가한다.

## Public API

```ts
type SharedBrowserEventListener = (event: Event) => void;

function subscribeWindowResize(listener: SharedBrowserEventListener): () => void;
function subscribeWindowScroll(
  listener: SharedBrowserEventListener,
  capture?: boolean,
): () => void;
function subscribeVisualViewportResize(listener: SharedBrowserEventListener): () => void;
function subscribeVisualViewportScroll(listener: SharedBrowserEventListener): () => void;
function subscribeViewportResize(listener: SharedBrowserEventListener): () => void;
function subscribeViewportScroll(
  listener: SharedBrowserEventListener,
  options?: { window?: boolean; windowCapture?: boolean; visual?: boolean },
): () => void;
function subscribeViewportGeometry(
  listener: SharedBrowserEventListener,
  options?: {
    windowScroll?: boolean;
    windowScrollCapture?: boolean;
    orientation?: boolean;
  },
): () => void;
```

## 예제

```ts
import { subscribeViewportGeometry } from "@musecat/functionkit/web";

function remeasure(_event: Event) {
  // Measure the caller-owned element's geometry here.
}

const unsubscribe = subscribeViewportGeometry(remeasure, {
  windowScroll: true,
  windowScrollCapture: true,
});

unsubscribe();
```

## Runtime과 dependency

Client-only browser utility다. Module import 자체는 target이 없는 환경에서도 안전하지만 실제 구독 의미는 browser의 `window`/`visualViewport`가 있을 때만 생긴다.

## 접근성

해당 없음. 이 API는 DOM semantic을 렌더링하지 않고 browser event 전달만 소유한다.

## 오류와 cleanup

Each caller owns its idempotent unsubscribe, bound to that specific registration/channel. A stale unsubscribe cannot detach a replacement target or a re-subscribed callback. The final registration releases the native listener; target replacement releases the stale target immediately. Consumers must release their registrations during lifecycle cleanup.

## 금지 패턴

- consumer에서 같은 window/visualViewport event를 위한 별도 module-level multiplex map을 만들지 않는다.
- `@musecat/functionkit/packages/...` deep import를 사용하지 않는다.

## 검증

[`sharedBrowserEvents.test.ts`](../../../tests/utils/sharedBrowserEvents.test.ts)가 listener 공유, Event 전달, capture 분리, target 교체, visualViewport, cleanup을 고정한다. 변경 시 FunctionKit typecheck와 public manifest/reference 검증을 함께 실행한다.
