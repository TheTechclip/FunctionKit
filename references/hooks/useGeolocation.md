# useGeolocation

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web` (root is the compatibility alias)

**Source:** [`useGeolocation.ts`](../../web/packages/hooks/useGeolocation.ts)
**Tests:** [`useGeolocation.test.ts`](../../tests/hooks/useGeolocation.test.ts)

## 목적과 소유권

브라우저의 위치 조회와 연속 추적을 소유한다. 제품의 인증 조건, 저장소 기록, 거리 정책은 소비자가 소유한다.

## Public API

```ts
function useGeolocation(options?: {
  enabled?: boolean;
  mountBehavior?: "get" | "watch" | "get-then-watch";
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}): {
  loading: boolean;
  error: string | null;
  data: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number;
  } | null;
  getCurrentPosition: () => void;
  startTracking: () => void;
  stopTracking: () => void;
  isTracking: boolean;
};
```

## 동작 계약

`enabled`의 기본값은 true다. false이면 자동 조회와 imperative 조회·추적 시작을 실행하지 않는다.
`get`은 한 번 조회하고, `watch`는 연속 추적한다. `get-then-watch`는 초기 조회가 성공한 뒤
watch를 시작한다. 초기 timeout 등 권한 거부 외 오류에도 watch를 시작하여 후속 위치로 복구할 수 있다.
권한 거부 시 watch를 시작하지 않는다. 자동 모드를 지정하지 않으면 imperative API만 사용한다.

## 오류와 cleanup

`get-then-watch` 초기 요청이 완료되기 전에 비활성화하거나 unmount하면 늦은 callback을 무시하며
watch를 시작하지 않는다. 비활성화, unmount, `stopTracking`에서 `clearWatch`를 호출하고 종료된
watch의 callback을 무시한다. 마지막 data는 비활성화 후에도 유지될 수 있으므로 소비자는 활성 상태를
기준으로 사용 여부를 결정한다. 위치를 영속 저장하지 않는다.

## 예제

```tsx
const location = useGeolocation({
  enabled: needsLocation,
  mountBehavior: "get-then-watch",
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 10_000,
});
```

## 검증

위 test가 조회·추적, 초기 오류 복구, 비활성화와 unmount cleanup의 계약 근거다.

## Runtime과 dependency

React client hook이며 브라우저 Geolocation API를 사용한다. Server Component에서 실행하지 않는다.

## 접근성

Hook은 DOM을 렌더링하지 않는다. 소비자가 위치 상태의 안내와 버튼의 활성 상태를 제공한다.

## 금지 패턴

- 내부 경로를 deep import하지 않는다.
- 제품별 인증 정책이나 영속 저장을 이 hook에 넣지 않는다.
- 비활성화 후 남은 data를 현재 추적 결과로 취급하지 않는다.
