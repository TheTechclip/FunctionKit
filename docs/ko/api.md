# API 한눈에 보기

[한국어](./api.md) | [English](../en/api.md)

이 문서는 “어떤 기능을 써야 하나?”를 빠르게 찾기 위한 지도입니다. 정확한 시그니처와 기본값, 예외 처리까지 필요하면 연결된 reference를 확인하세요.

## 상태와 상호작용

| API | 이런 때 씁니다 |
| --- | --- |
| `useControllableState` | controlled/uncontrolled 방식을 한 컴포넌트 API에서 함께 지원할 때 |
| `useToggleState` | 단순 boolean 상태와 toggle/set 동작이 필요할 때 |
| `useCollectionSelection` | 단일·다중 선택, 범위 선택, 전체 선택을 다룰 때 |
| `useLongPress` | pointer/touch long-press 동작과 cleanup이 필요할 때 |
| `useDoubleClick` | single/double activation을 구분해야 할 때 |

세부 계약: [controllable state](../../references/hooks/useControllableState.md), [collection selection](../../references/hooks/useCollectionSelection.md), [long press](../../references/hooks/useLongPress.md).

## 타이밍과 안정적인 callback

- `debounce` — React와 무관한 범용 debounce
- `useDebounce` — 인자가 있는 callback 호출을 debounce하고 취소
- `useDebouncedCallback` — boolean 변경을 debounce하고 마지막 확정 값으로 돌아오면 대기 중 변경 취소
- `useInterval`, `useTimeout` — timer lifecycle
- `usePreservedCallback` — 함수 identity를 유지하고 React effect 실행 후 최신 구현 반영
- `usePreservedReference` — comparator가 같다고 판단하는 동안 이전 값 자체를 반환 (ref 객체가 아님)
- `useRefEffect` — ref target이 바뀔 때 setup/cleanup 연결

## 키보드·뷰포트·가시성

- `useKeyboardListNavigation` — 방향키, Home/End, typeahead가 필요한 리스트 UI
- `useKeyboardHeight`, `subscribeKeyboardHeight` — 가상 키보드 높이 추적
- `useAvoidKeyboard` — 가상 키보드와 겹치지 않도록 UI 보정
- `useViewportMatch` — media query 구독
- `useViewportHeight` — 사용 가능한 viewport 높이 추적
- `useIntersectionObserver` — intersection lifecycle
- `useCheckInvisible` — target이 화면에서 벗어났는지 확인
- `useCheckScroll` — scroll 가능 여부나 상태 확인
- `useScrollLock` — document scroll lock 소유와 해제

더 낮은 수준이 필요하면 `subscribeWindowResize`, `subscribeWindowScroll`, `subscribeViewportResize`, `subscribeViewportScroll`, `subscribeVisualViewportResize`, `subscribeVisualViewportScroll`, `subscribeViewportGeometry`를 직접 쓸 수 있습니다.

## 브라우저 저장과 capability

### Storage

`getLocalStorage`, `updateLocalStorage`, `removeLocalStorage`, `getSessionStorage`, `updateSessionStorage`, `removeSessionStorage`를 제공합니다.

### Cookie

`getClientCookie`, `setClientCookie`, `clearClientCookie`, `clearAllClientCookies`가 client cookie를 다룹니다. `parseClientCookieNames`는 Universal입니다.

### 읽음 상태

직렬화 자체는 저장 방식과 분리돼 있습니다.

- `parseReadState`
- `hasReadState`
- `markReadState`

필요한 저장 방식만 골라서 붙일 수 있습니다.

- Cookie: `getCookieReadState`, `hasCookieReadState`, `markCookieReadState`
- Storage: `getStorageReadState`, `hasStorageReadState`, `markStorageReadState`

저장 key는 FunctionKit이 정하지 않습니다. 앱에서 이름을 정해 넘기면 됩니다.

### Clipboard와 Share

`NavigatorClipboard`, `NavigatorShare`는 브라우저 지원 여부와 실패 결과를 typed result로 정리합니다.

### Device와 editable target

`getDeviceInfo`는 브라우저가 아닌 환경에서도 안전하게 import할 수 있는 fallback을 갖습니다. `isEditableKeyboardTarget`은 전역 keyboard handler가 input/contenteditable을 가로채지 않도록 할 때 유용합니다.

## 렌더링 보조

| API | 역할 |
| --- | --- |
| `SwitchCase` | 제품 정책 없이 조건부 렌더링을 구성 |
| `ViewportPortal`, `getViewportPortalRoot` | viewport 단위 portal root 사용 |
| `ScrollTo` | window나 지정 element를 원하는 좌표로 이동 |

## 범용 유틸리티

- URL/문자열: `toURL`, `isHttpUrl`, `isEmailAddress`, `normalizeHostname`, `hostMatchesAny`, `toTrimmedString`
- ref/context: `mergeRefs`, `buildContext`
- 메모리 navigation: `createMemoryHistory`
- Escape 조정: `acquireEscapeDismissalBlock`, `isEscapeDismissalBlocked`

## 레이어 밝기 측정

`useLayerLuminance`는 target 뒤에 렌더링된 surface를 샘플링해 `0..1` luminance를 반환합니다. `resolveLuminanceThreshold`는 필요할 때만 쓰는 hysteresis helper이며 실제 threshold 값은 앱이 정합니다.

이미지가 포함된 surface는 canvas 보안과 fallback 규칙이 있으므로 [reference](../../references/hooks/useLayerLuminance.md)를 먼저 확인하는 편이 좋습니다.

## 전체 목록

여기서는 type export까지 94개를 전부 늘어놓지 않습니다. 전체 심볼, runtime, source, reference 연결은 자동 생성되는 [`publicApi.manifest.json`](../../publicApi.manifest.json)이 정본입니다.
