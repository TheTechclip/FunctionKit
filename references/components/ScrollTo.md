# ScrollTo

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web` (root is the compatibility alias)

**Source:** [`ScrollTo.tsx`](../../web/packages/components/ScrollTo.tsx)
**Tests:** [`ScrollTo.test.tsx`](../../tests/components/ScrollTo.test.tsx)

## 목적과 소유권

브라우저 window 또는 소비자가 지정한 element를 명시적 좌표로 스크롤하는 imperative component다. 특정 route 정책이나 "top" 의미는 소비자가 소유한다.

## Public API

```ts
interface ScrollToProps {
  left?: number;
  top?: number;
  behavior?: ScrollBehavior;
  target?: React.RefObject<Element | null>;
}
function ScrollTo(props: ScrollToProps): null;
```

## Runtime과 dependency

React client component이며 `window.scrollTo` 또는 target element의 `scrollTo`를 사용한다.

## 동작 계약

`left`와 `top`은 각각 `0`, `behavior`는 `"auto"`가 기본값이다. `target.current`가 있으면 element를, 없으면 window를 스크롤한다. destination prop이 바뀌면 다시 적용한다.

## 접근성

DOM을 렌더링하지 않는다. focus 이동을 수행하지 않으므로 route navigation의 focus management는 소비자가 별도로 소유한다.

## 오류와 cleanup

지속 리소스를 만들지 않는다. target ref가 비어 있으면 window fallback을 사용한다.

## 예제

```tsx
<ScrollTo top={320} behavior="smooth" />
<ScrollTo target={panelRef} left={0} top={0} />
```

## 금지 패턴

- route-specific top reset 정책을 FunctionKit 내부에 넣지 않는다.
- scroll 후 focus/selection까지 암묵적으로 변경하지 않는다.

## 검증

위 test가 기본 destination 호출 계약을 검증한다.
