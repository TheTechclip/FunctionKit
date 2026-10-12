# Runtime과 SSR

[한국어](./runtime.md) | [English](../en/runtime.md)

FunctionKit에서는 실행 환경도 공개 API 계약의 일부로 봅니다. 각 심볼의 현재 분류는 [`publicApi.manifest.json`](../../publicApi.manifest.json)에 기록됩니다.

## Universal

브라우저 전용 전역 객체를 필요로 하지 않고 서버와 브라우저에서 같은 의미로 동작하는 API입니다.

```ts
import {
  debounce,
  hasReadState,
  isHttpUrl,
  mergeRefs,
  parseReadState,
} from "@musecat/functionkit";
```

이런 함수를 import했다는 이유만으로 Next.js client boundary가 생기지는 않습니다.

## Client-only

브라우저 상태나 브라우저 API, React client hook이 필요한 API입니다. 필요한 소스에는 `"use client"` 경계가 유지됩니다.

대표적으로 다음 항목이 여기에 속합니다.

- `useDebounce`
- `useViewportMatch`
- `useKeyboardHeight`
- `ViewportPortal`
- cookie/storage adapter
- browser event subscription

Client Component 또는 브라우저가 소유하는 코드에서 사용하세요.

## Guarded browser fallback

서버에서 import하는 것 자체는 안전하지만 브라우저 기능이 없는 환경에서는 문서에 적힌 fallback을 반환하는 API입니다.

현재 대표 사례는 `getDeviceInfo`입니다. 서버 결과에 의존하기 전에는 [reference](../../references/utils/browser/getDeviceInfo.md)를 확인하세요.

## 타입과 값의 runtime은 다를 수 있습니다

런타임 함수는 Client-only여도 그 함수가 사용하는 타입 export는 Universal일 수 있습니다. FunctionKit은 파일 하나에 같은 label을 붙이는 대신 공개 심볼별로 runtime을 기록합니다.

## 이 저장소의 SSR 원칙

1. Universal export의 모듈 평가 시점에는 `window`, `document`, `navigator`, `localStorage`를 읽지 않습니다.
2. 저장 방식이나 환경 접근을 순수 함수 안에 숨기지 않고 adapter로 드러냅니다.
3. 제품 정책은 라이브러리에 넣지 않습니다. 예를 들어 `useLayerLuminance`는 측정값만 돌려주고, 어느 밝기부터 dark로 볼지는 앱이 결정합니다.
4. manifest와 reference도 API의 일부입니다. runtime이 바뀌면 구현, 테스트, 문서를 같은 변경에서 함께 수정합니다.
