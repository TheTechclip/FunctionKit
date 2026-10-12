# debounce

> 상태: Reference
>
> Runtime: Universal
>
> Public surface: `@musecat/functionkit/web` (`@musecat/functionkit`은 호환 alias)

**Source:** [`debounce.ts`](../../web/packages/utils/debounce.ts)
**Tests:** [`useDebounce.test.ts`](../../tests/hooks/useDebounce.test.ts), [`index.test.ts`](../../tests/index.test.ts)

## 목적과 소유권

React/browser와 무관한 debounce scheduling primitive다. 호출 인수/`this`, leading/trailing edge와 cancellation만 소유하며 retry, request cancellation, product rate-limit 정책은 소유하지 않는다.

## Public API

- `DebounceEdge`: `"leading" | "trailing"`.
- `DebouncedFunction<F>`: 원본 arguments를 받는 void 함수이며 `.cancel()`을 제공한다.
- `debounce(callback, wait, { edges? })`: 기본적으로 leading과 trailing 둘 다 활성화한다.

## Runtime과 dependency

`setTimeout`/`clearTimeout`만 사용하므로 RSC를 포함한 server/client runtime에서 import 가능하다. shared entry에서 사용할 수 있다.

## 동작 계약

- `wait`는 음수여도 `0` 이상으로 clamp한다.
- leading은 active timer가 없을 때 첫 호출을 즉시 실행한다.
- trailing은 quiet period가 끝날 때 가장 최근 pending arguments/`this`로 실행한다.
- 기본 `[leading, trailing]`에서는 첫 호출이 즉시 실행되고, 같은 window 안에 추가 호출이 있으면 마지막 값이 trailing 실행된다.
- leading-only는 window 안 추가 호출을 실행하지 않고 timer 종료 후 다음 호출이 새 leading이 된다.
- `.cancel()`은 timeout과 pending arguments/`this`를 모두 제거한다.

## 접근성

해당 없음 — scheduling utility이며 UI semantic을 소유하지 않는다.

## 오류와 cleanup

callback이 던지는 오류를 삼키지 않는다. 장기 사용을 중단할 때 consumer는 `.cancel()`로 pending trailing callback을 제거할 수 있다.

## 예제

```ts
import { debounce } from "@musecat/functionkit";

const commit = debounce((query: string) => search(query), 250, {
  edges: ["trailing"],
});
commit("museum");
// 더 이상 필요 없으면 commit.cancel();
```

## 금지 패턴

- React state debounce가 필요하다는 이유만으로 동일 timer logic을 component 안에 복제하지 않는다.
- lifecycle 종료 시 실행되면 안 되는 pending callback을 방치하지 않는다.
- debounce와 request abort semantics를 같은 것으로 취급하지 않는다.

## 검증

`useDebounce.test.ts`가 trailing, leading+trailing, leading-only, cancel과 latest argument behavior를 fake timer로 검증하며 `index.test.ts`가 public root export를 확인한다.
