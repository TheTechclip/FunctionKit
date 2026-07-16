# FunctionKit (@musecat/functionkit)

React 19 기반 프론트엔드 유틸 라이브러리. 단일 패키지, ESM. 모든 훅/유틸/컴포넌트는 `index.ts` 배럴을 통해 `@musecat/functionkit`에서 import한다. 서브패스(`@musecat/functionkit/hooks/useX`)도 가능하나 배럴优先.

## AI 사용 규칙 (필수)

- **모든 구현에서 반드시 이 FunctionKit을 먼저 참조한다.** 훅·유틸·날짜포맷·쿠키·스토리지·컴포넌트가 필요하면 예외 없이 아래 목록을 먼저 확인하고 존재하면 그것을 사용한다.
- **직접 구현 금지.** 여기 있는 기능을 새로 짜거나 유사 기능을 중복 구현하는 것은 금지한다. 여기 없는 것만 새로 만든다.
- **import는 배럴 경로만 사용:** `import { useDebounce } from "@musecat/functionkit"`.
- SSR 주의: `"use client"` 없는 순수 함수(shared, seen, cookie.shared, debounce, mergeRefs, isEditableKeyboardTarget, floatingMotion, SwitchCase)만 서버 컴포넌트에서 사용 가능. 나머지는 반드시 클라이언트 컴포넌트.
- 타입 import도 배럴: `import type { AppLocale, DateInput } from "@musecat/functionkit"`.

---

## Hooks — 완전 분석

### useHasMounted
`useHasMounted(): boolean` — 마운트 전 `false`, 후 `true`. hydration guard로 사용. useEffect 한 번으로 state 전환.
```tsx
const mounted = useHasMounted()
if (!mounted) return null // SSR/SSG에서 클라이언트 전용 UI 숨기기
```

### usePreservedCallback
`usePreservedCallback<Args extends unknown[], Return>(callback: (...args: Args) => Return): (...args: Args) => Return`
- ref에 callback을 저장해서 항상 최신 참조 유지. 반환된 함수는 절대 재생성되지 않음.
- 자식 컴포넌트에 callback prop으로 넘길 때 불필요한 리렌더 방지.
- 내부적으로 `useDebounce`, `useIntersectionObserver`, `useInterval`, `useTimeout` 등 많은 훅이 이 함수에 의존함.

### usePreservedReference
`usePreservedReference<T>(value: T, areValuesEqual?: (a: T, b: T) => boolean): T`
- 기본 비교는 `JSON.stringify(a) === JSON.stringify(b)`. 깊은 비교로 stable reference 반환.
- 객체/배열이 내용은 같은데 참조만 바뀌는 경우 의존성 배열에 쓸 때 유용.
- 예: `useEffect(fn, [usePreservedReference(options)])` — options 객체 내용이 같으면 effect 재실행 안 함.
- 주의: JSON.stringify의 한계 — undefined, Symbol, circular reference는 무시됨.

### useDebounce
`useDebounce(callback, wait: number, options?: { leading?, trailing? }): { (...args): void, cancel(): void }`
- `{ leading: false, trailing: true }`가 기본.
- 내부적으로 `usePreservedCallback`으로 callback 고정 + `useMemo`로 debounced 함수 생성.
- 반환된 함수의 `cancel()`로 pending 취소 가능. unmount 시 자동 cancel.
- pure 함수 `debounce(fn, debounceMs, { edges })`도 export됨 — edges는 `["leading", "trailing"]` 배열.
- **용례:** 검색어 입력(300ms), 저장 버튼 중복 방지, 스크롤 이벤트 제한.
```tsx
const handleSearch = useDebounce((term: string) => fetchResults(term), 300)
```

### useDebouncedCallback
`useDebouncedCallback({ onChange, timeThreshold, leading?, trailing? }): (nextValue: boolean) => void`
- boolean 값만 받음. 동일한 값 들어오면 조기 return (no-op).
- debounce 인스턴스를 매 호출마다 새로 생성 (이전 pending cancel 후 새로 등록).
- **용례:** 토글 스위치 변경 이벤트 디바운스, 체크박스 onChange 지연 처리.

### useDoubleClick
`useDoubleClick<E extends HTMLElement>({ delay?, click?, doubleClick }): (event: MouseEvent<E>) => void`
- 반환된 함수를 `onClick`에 바인딩. `event.detail`로 싱글/더블클릭 구분.
- delay(기본 250ms) 내 두 번째 클릭이 없으면 `click` 호출, 있으면 `doubleClick` 호출하고 pending 취소.
- `click` 없으면 싱글클릭 시 아무 일도 안 일어남 (그래도 timer는 돔).
- ref로 callback 관리 → 항상 최신 참조, 리렌더 영향 없음.
- **용례:** 리스트 아이템 싱글클릭 미리보기 / 더블클릭 상세보기, 파일명 더블클릭 수정.

### useLongPress
`useLongPress<E>(onLongPress, { delay?, moveThreshold?, onClick?, onLongPressEnd? }): { onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd, onTouchMove?, onMouseMove? }`
- delay 기본 500ms. `moveThreshold` 설정 시 지정 픽셀 이상 움직이면 long press 취소.
- mouse/touch 이벤트 통합. `onMouseLeave`도 timeout 취소.
- long press 성공 시 `onLongPress` 즉시 호출, `onLongPressEnd`는 mouseup/touchend 시 호출.
- 실패 시 `onClick` 호출 (long press가 아니었다는 의미).
- **용례:** 채팅 메시지 길게 눌러 컨텍스트 메뉴, 아이콘 길게 눌러 드래그 시작.

### useGeolocation
`useGeolocation(options): { loading, error, data, getCurrentPosition, startTracking, stopTracking, isTracking }`
- `mountBehavior: "get"`(기본, 한 번 조회) | `"watch"`(계속 추적).
- SSR: `typeof window` 체크로 안전. 지원 안 하면 error 설정.
- `enableHighAccuracy: false`, `maximumAge: 0`, `timeout: Infinity` 기본.
- data 타입: `{ latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed, timestamp }`.
- `startTracking()`/`stopTracking()`으로 동적으로 watch on/off.
- **용례:** 사용자 위치 기반 검색, 길찾기, 출퇴근 기록.

### useIntersectionObserver
`useIntersectionObserver<Element extends HTMLElement>(callback, options): (element: Element | null) => void`
- 반환값을 ref callback에 전달: `ref={observerRef}`. ref 콜백은 `useRefEffect` 기반.
- SSR: `IntersectionObserver` 없으면 observer 생성 안 함 (no-op).
- options 그대로 `IntersectionObserverInit` 전달 (threshold, rootMargin 등).
- **용례:** 무한 스크롤 트리거, 이미지 lazy loading, 광고 노출 추적.
```tsx
const ref = useIntersectionObserver((entry) => {
  if (entry.isIntersecting) loadMore()
}, { threshold: 0.1 })
```

### useInterval
`useInterval(callback, options: number | { delay, immediate?, enabled? }): void`
- number = delay(ms). `{ immediate: true }`면 첫 tick 전에 한 번 실행. `enabled: false`면 interval 정지.
- StrictMode에서 immediate 중복 실행 방지 (ref로 guard).
- `enabled` 토글 시 interval 정지/재시작.
- **용례:** 폴링(5초마다 상태 갱신), 실시간 시계, 캐러셀 자동 재생.

### useTimeout
`useTimeout(callback, delay?, options?: { enabled? }): { start, reset, clear, isPending }`
- `enabled: true`(기본)면 mount 시 자동 시작, deps 변경 시 재시작.
- 명령형 제어: `start(overrideDelay?)`/`reset(overrideDelay?)` 직접 실행, `clear()` 취소, `isPending()` 실행 중 여부.
- `start`와 `reset`은 동일 함수 (alias). `enabled: false`면 pending timer도 clear.
- **용례:** 토스트 메시지 자동 사라짐(3초), 애니메이션 순차 실행, idle 상태 감지.

### useToggleState
`useToggleState(initialValue?: boolean): { value, setValue, setTrue, setFalse, toggle }`
- `initialValue` 기본 `false`. 모든 setter 함수는 stable (useCallback deps=[]).
- **용례:** 모달 열림/닫힘, 사이드바 토글, 접힘/펼침 UI.

### useKeyboardHeight / useAvoidKeyboard
`useKeyboardHeight(): { keyboardHeight: number }`
- `subscribeKeyboardHeight({ immediate: true })`로 visualViewport 변화 구독.
- 모바일 키보드 높이를 px 단위로 반환 (닫히면 0).

`useAvoidKeyboard({ safeAreaBottom?, transitionDuration?, transitionTimingFunction? }): { style: React.CSSProperties }`
- `useKeyboardHeight()`로 높이 얻어 transform: translateY로 회피. keyboardHeight=0이고 safeAreaBottom=0이면 transform 없음.
- transition: `200ms ease-out` 기본.
- **용례:** 모바일에서 입력 필드가 키보드에 가려지지 않도록 뷰포트 밀어올리기.
```tsx
const { style } = useAvoidKeyboard({ safeAreaBottom: 16 })
return <input style={style} />
```

### useKeyboardListNavigation
`useKeyboardListNavigation({ itemCount }): { activeIndex, setActiveIndex, setItemRef, clickActiveItem, focusBoundaryItem, handleListKeyDown }`
- 방향키(ArrowDown/Up)로 리스트 탐색, Home/End로 처음/끝, Enter/Space로 활성 아이템 클릭, Escape로 선택 해제(activeIndex=-1).
- `itemCount=0`이면 아무 동작 안 함. `event.defaultPrevented`면 스킵. editable input에서는 동작 안 함.
- `setItemRef(index, element)`로 각 아이템 ref 등록. `focusBoundaryItem(key)`는 탭 네비게이션용 (첫 항목/마지막 항목 focus).
- `clickActiveItem()`은 현재 active 아이템의 click() 호출. 없으면 false 반환.
- **용례:** 드롭다운 메뉴 키보드 탐색, 검색 자동완성 리스트, 커맨드 팔레트.

### useViewportHeight
`useViewportHeight(): { height: number }`
- `window.visualViewport.height` 우선, 없으면 `window.innerHeight`. SSR에선 0.
- `visualViewport.resize` + `window.resize` 모두 구독.
- **용례:** 모바일 100vh 대체 (주소창 등으로 인한 실제 뷰포트 높이), 키보드 올라왔을 때 레이아웃 대응.

### useViewportMatch
`useViewportMatch(mediaQuery: string): boolean`
- `window.matchMedia(mediaQuery).matches` 반환. SSR에선 false.
- media query change 이벤트 구독 → 실시간 반영.
- **용례:** `const isMobile = useViewportMatch("(max-width: 768px)")` — 반응형 로직.

### useClientDateTime
`useClientDateTime(value: DateInput, { locale?, timeZone?, datePreset?, timePreset? }): { ready, text, date }`
- `ready`는 hydration guard (초기 false → effect에서 true).
- `formatClientDateTime()`으로 텍스트 생성. value/options 바뀔 때마다 재포맷.
- **용례:** 클라이언트에서만 날짜 표시 (SSR 불일치 방지).

### useRelativeDateTime
`useRelativeDateTime(value: DateInput, { locale?, maxRelativeDays?, fallbackDatePreset?, updateIntervalMs? }): { ready, text, isRelative, date }`
- `maxRelativeDays`(기본 7) 초과 시 절대 날짜(fallbackDatePreset 기본 "dot")로 표시.
- `updateIntervalMs`(기본 1000ms)마다 갱신. `"3분 전"`, `"2시간 전"` 등 실시간 업데이트.
- **용례:** 게시글 작성 시간, 댓글 시간, 채팅 메시지 timestamp.

### useRefEffect
`useRefEffect<RefElement>(callback, deps): (element: RefElement | null) => void`
- callback ref 생성. element 부착 시 callback 실행, cleanup 반환 가능. unmount 시 cleanup 실행.
- deps 바뀌면 old cleanup → new callback.
-**용례:** DOM에 직접 이벤트 리스너 부착, IntersectionObserver 연결, 외부 라이브러리 DOM 초기화.
```tsx
const ref = useRefEffect((el) => {
  const handler = () => {}
  el.addEventListener("scroll", handler)
  return () => el.removeEventListener("scroll", handler)
}, [])
```

---

## Components — 완전 분석

### `<ScrolltoTop />`
`export function ScrolltoTop(): undefined`
- `"use client"`. useEffect로 모든 렌더 시 `window.scrollTo(0, 0)` 실행. 의존성 배열 없음 → 매 렌더마다 실행.
- **용례:** 페이지 이동 시 스크롤 최상단 리셋. `<ScrolltoTop />`를 layout에 한 번 배치.
- 주의: 모든 상태 변경 시 스크롤이 리셋되므로 조건부 삽입하거나 최상위 layout에만 배치할 것.

### `<SwitchCase />`
`SwitchCase<T extends string | number>({ value, cases, otherwise }): ReactNode`
- `"use client"` 없음 → 서버에서도 사용 가능.
- `cases[value] ?? otherwise`. value가 cases에 없으면 otherwise, otherwise도 없으면 null.
- typesafe: case key가 T로 제한됨. Partial이라 모든 경우를 다룰 필요 없음.
- **용례:** 조건부 렌더링을 삼항연산자 대신 선언적으로.
```tsx
<SwitchCase
  value={status}
  cases={{
    loading: <Spinner />,
    error: <ErrorMsg />,
    success: <Content />,
  }}
  otherwise={<NotFound />}
/>
```

### `<ViewportPortal />` / `getViewportPortalRoot()`
- `getViewportPortalRoot()`: SSR safe. 최초 호출 시 `position:fixed;inset:0;pointer-events:none;z-index:9999` div 생성.
- `<ViewportPortal>`: `createPortal`로 자식들을 위 div에 렌더. useEffect로 root 연결 전까진 null 반환 (hydration safe).
- pointer-events:none이라 portal 내부 요소는 별도로 pointer-events:auto 필요.
- **용례:** 모달/툴팁/드롭다운을 DOM 트리 최상단에 렌더링 (z-index 충돌 방지, overflow:hidden 탈출).
```tsx
<ViewportPortal>
  <div style={{ pointerEvents: "auto" }}>
    <Modal />
  </div>
</ViewportPortal>
```

---

## Utils — 완전 분석

### browserStorage
`getLocalStorage(key): unknown` / `updateLocalStorage(key, value): void` / `removeLocalStorage(key): void`
- 동일한 API로 SessionStorage 버전도 있음: `getSessionStorage`, `updateSessionStorage`, `removeSessionStorage`.
- 내부적으로 SSR 체크 후 JSON.stringify/parse. 파싱 실패, 용량 초과 등 모든 에러 조용히 처리 (try-catch).
- 저장할 때 직접 `JSON.stringify`, 불러올 때 `JSON.parse`. 값이 없거나 파싱 실패 시 null.
- **용례:** 사용자 설정 유지 (테마, 언어), 최근 검색어 저장.
```tsx
updateLocalStorage("theme", "dark")
const theme = getLocalStorage("theme") // "dark"
```

### buildContext
`buildContext<T>(defaultValue): [Provider, useValue]`
- `Provider`: value를 `useMemo`로 감싸 불필요한 리렌더 방지.
- `useValue`: 단순 `useContext(context)`. Provider 없이 호출해도 에러 안 남 (defaultValue 반환).
- createContext를 직접 쓰는 것보다 안전하고 간결.
- **용례:** 전역 상태 관리가 필요할 때 Context Provider 패턴을 간단히.
```tsx
const [ThemeProvider, useTheme] = buildContext("light")
// <ThemeProvider value="dark">...</ThemeProvider>
// const theme = useTheme() // "dark"
```

### getDeviceInfo
`getDeviceInfo(): DeviceInfo`
- 반환: `{ isMobile, isIOS, isAndroid, isSafari, isIOSSafari, isMacSafari, isSamsungBrowser, isTouchDevice, browser }`
- SSR: window 없으면 모든 값 false. `isTouchDevice`는 `"ontouchstart" in window` 체크.
- browser: samsung > safari > chrome > firefox > edge > unknown 순서로 판별.
- UA로 판별하므로 User-Agent 스푸핑에 취약하지만 실제 환경에선 충분히 정확.
- **용례:** 모바일 웹에서 iOS/Android 분기 처리, Safari 전용 스타일/로직.

### NavigatorClipboard / NavigatorShare
`NavigatorClipboard({ text }): Promise<{ success: boolean }>` — `navigator.clipboard.writeText` 호출.
`NavigatorShare({ title, text, link }): Promise<{ success: boolean, method: "share" | "clipboard" | "unsupported" }>`
- `navigator.share()` 우선 시도. 사용자 취소(AbortError)면 `{ success: false, method: "share" }`.
- share 실패 시 clipboard fallback. clipboard도 없으면 `{ method: "unsupported" }`.
- **용례:** 공유 버튼 → 모바일 네이티브 Share Sheet, 데스크톱에선 링크 복사.
```tsx
if (result.success && result.method === "share") trackShared()
```

### floatingMotion
`getFloatingMotionPreset(mode): { enterMs, exitMs, ease }`

| mode | enterMs | exitMs | ease |
|---|---|---|---|
| anchored | 230 | 170 | cubic-bezier(0.16, 1, 0.3, 1) |
| center-selected | 190 | 140 | cubic-bezier(0.2, 0, 0, 1) |
| modal-center | 340 | 260 | cubic-bezier(0.22, 1, 0.36, 1) |
| mobile-sheet | 360 | 280 | cubic-bezier(0.2, 0.8, 0.2, 1) |

`getFloatingTransformOrigin(placement?): string` — placement("bottom-left" 등)를 CSS transform-origin으로 변환. top→bottom, left→left, bottom→top, center→center. 기본값 "top center".
`getFloatingHiddenTransform({ mode, placement }): string` — hidden 상태의 transform 값.
- mobile-sheet: translateY(1.8rem) scale(1)
- modal-center: translateY(.8rem) scale(.94)
- center-selected: translateY(.45rem) scale(.99)
- anchored: placement의 위/아래/좌우에 따라 translateY 또는 translateX

**용례:** Floating UI(focus-trap, portal, auto-update)와 함께 사용하여 드롭다운/모달/시트의 enter/exit 애니메이션 구성. framer-motion의 initial/exit에 이 값들 전달.

### isEditableKeyboardTarget
`isEditableKeyboardTarget(target: HTMLElement): boolean`
- true 반환 조건: `contentEditable === "true"`, `TEXTAREA`, `SELECT`, `INPUT`(type이 hidden/file/submit/reset 등이 아닌 경우).
- 키보드 이벤트 핸들러에서 `isEditableKeyboardTarget(event.target)`로 체크 → 입력 중에는 단축키 동작 막기.
- **용례:** `onKeyDown`에서 방향키/Enter 이벤트를 입력 필드에선 무시.

### mergeRefs
`mergeRefs<T>(...refs: (Ref<T> | undefined | null)[]): RefCallback<T>`
- 함수 ref는 직접 호출, 객체 ref는 `.current` 할당. null/undefined는 안전하게 무시.
- **용례:** 외부 ref와 내부 ref를 동시에 한 요소에 연결.
```tsx
const internalRef = useRef(null)
const externalRef = useRef(null)
return <div ref={mergeRefs(internalRef, externalRef)} />
```

### seen
`SEEN_STORAGE_KEY = "seen"`
`parseSeen(raw: string | null): Record<string, boolean>` — JSON 파싱, 실패 시 `{}`.
`hasSeenKey(raw: string | null, key: string): boolean` — 특정 키를 본 적 있는지.
`buildSeenValue(raw: string | null, key: string): string` — 키를 seen에 추가한 JSON 문자열 반환.
- 모두 순수 함수, SSR 안전. localStorage에 "seen" 키로 저장하는 패턴 전제.
- **용례:** 공지사항/업데이트 알림 "다시 보지 않음" 체크, onboarding 진행 상태, 읽은 글 목록 관리.
```tsx
const raw = getLocalStorage(SEEN_STORAGE_KEY)
if (!hasSeenKey(raw, noticeId)) {
  updateLocalStorage(SEEN_STORAGE_KEY, buildSeenValue(raw, noticeId))
  showNotice()
}
```

### subscribeKeyboardHeight
`subscribeKeyboardHeight({ callback, immediate?, throttleMs? }): { unsubscribe }`
- `visualViewport.resize`/`scroll` 구독. 높이 계산: `window.innerHeight - visualViewport.height` (0 이상 clamp).
- throttleMs 기본 16ms(≈60fps). 0 이하로 설정하면 동기 실행.
- `immediate: true`면 구독 즉시 callback 실행.
- **용례:** `useKeyboardHeight()` 훅이 내부적으로 사용. 직접 구독이 필요한 경우 (React 외부에서 DOM 직접 조작).

---

## Cookie — 완전 분석

### cookie.shared.ts
모든 함수에 SSR guard 있음 → 서버에선 undefined/null 반환 또는 no-op.

`getClientCookie(name): string | undefined` — `document.cookie` 파싱하여 value 반환. 없으면 undefined.

`setClientCookie(name, value, days?): void` — `path=/`, URL 인코딩. days 생략 시 session cookie. `document.cookie = name=value; path=/; max-age=...`.

`clearClientCookie(name, { hostname?, path?, documentRef?, cookieStore? }): void` — 과거 만료일로 설정하여 삭제. 모든 서브도메인, 경로 조합을 순회하며 삭제. cookieStore가 있으면 우선 사용.

`clearAllClientCookies({ hostname?, path?, documentRef?, cookieStore?, includeRoot?, cookieString? }): string[]`
- hostname의 서브도메인 조합을 모두 생성하여 각각의 모든 경로(현재 path + includeRoot면 "/")에 대해 쿠키 삭제 시도.
- cookieStore가 있으면 `.delete()` 사용.
- 삭제된 쿠키 이름 배열 반환.

`parseClientCookieNames(cookieString: string): string[]` — "name=value; name2=value2" → ["name", "name2"].
**용례:** 로그인 토큰 관리, 사용자 설정 쿠키, A/B 테스트 배리언트 저장.

---

## DateTime — 완전 분석

### Shared (dateTime.shared.ts) — 순수 함수, 서버 안전

**타입:**
- `AppLocale = "kr" | "en" | "jp"`
- `DateInput = string | number | Date`
- `DatePreset = "long" | "dot"`
- `TimePreset = "ko" | "12h" | "24h-minute" | "24h-second"`

**유틸:**
- `toDate(value): Date | null` — Date 인스턴스면 복사 후 반환, 아니면 `new Date(value)`. 유효성 검사 후 null 가능.
- `toUtcMidnight(date): Date` — UTC 기준 해당일 00:00:00.000Z.
- `parseUtcDateInput(value?, fallback?): Date | null` — "YYYY-MM-DD" 문자열은 timezone 없이 UTC date로 파싱. 다른 형식은 toDate → toUtcMidnight.
- `addUtcDays(date, days): Date` — 새 Date 반환. `date.setUTCDate(date.getUTCDate() + days)`.
- `formatUtcDateKey(date): string` — "YYYY-MM-DD" UTC.
- `getUtcWeekdayIndex(date): number` — 0(일)~6(토) UTC.
- `normalizeAppLocale(locale?): AppLocale` — "ko"/"kr" → "kr", "ja"/"jp" → "jp", 나머지 → "en".
- `toIntlLocale(locale?): string` — "ko-KR" / "ja-JP" / "en-US".

**날짜 포맷:**
- `formatLongDate(date, locale?, timeZone?): string` — kr: "2024년 1월 1일", jp: "2024年1月1日", en: "January 1, 2024". Intl.DateTimeFormat.formatToParts로 커스텀 포맷.
- `formatDotDate(date, timeZone?): string` — "2024. 1. 1."

**시간 포맷:**
- `format24HourTime(date, { includeSeconds?, timeZone? }): string` — "14:30" / "14:30:00"
- `formatKoreanTime(date, timeZone?): string` — "오후 2시 30분"
- `formatTwelveHourTime(date, locale?, timeZone?): string` — kr: "오후 2:30", en/jp: Intl.DateTimeFormat hour12.

**상대 시간:**
- `formatRelativeText(diffMs, locale?): { text, isRelative }` — diffMs를 "N초 전", "N분 전", "N시간 전", "N일 전"(모든 locale)로 변환. diffMs는 0 이하로 clamp. 카운트는 최소 1.
- `formatRemainingText(diffMs, locale?, { includeSuffix? }): string` — 최대 2개 단위 조합. "2일 3시간 남음". diffMs=0이면 "마감됨" / "締切終了" / "Closed".

**용례 (공통 패턴):**
```tsx
// UTC date 키 생성
const dateKey = formatUtcDateKey(toUtcMidnight(new Date()))
// 상대 시간
const { text } = formatRelativeText(Date.now() - post.createdAt.getTime())
```

### Client (dateTime.client.ts) — "use client" 필요

`formatClientDate(value, { locale?, timeZone?, preset }): string` — preset으로 "long"/"dot" 선택. 유효하지 않은 날짜는 "" 반환.
`formatClientTime(value, { locale?, timeZone?, preset }): string` — "ko"/"12h"/"24h-minute"/"24h-second".
`formatClientDateTime(value, { locale?, timeZone?, datePreset?, timePreset? }): string` — date + " " + time. 기본 datePreset "long", timePreset "24h-minute". 둘 중 하나가 빈 문자열이면 다른 쪽만 반환.
`formatClientRelative(value, { locale?, now?, maxRelativeDays?, fallbackDatePreset? }): { text, isRelative }` — maxRelativeDays(기본 7) 초과 시 절대 날짜(fallbackDatePreset 기본 "dot"). 날짜 유효성 검사, 실패 시 `{ text: "", isRelative: false }`.

### Server (dateTime.server.ts) — 서버 렌더링용
`formatServerDate`, `formatServerTime`, `formatServerDateTime`, `formatServerRelative` — client와 동일한 로직. 차이점: `formatServerRelative`의 `now` 기본값이 `new Date()` (client는 `Date.now()`).

**datetime 선택 가이드:**
- 서버 컴포넌트에서 날짜 표시 → shared 함수 사용. timezone은 서버 timezone 기준.
- 클라이언트 hydration 후에도 계속 표시 → shared 함수. SSR/클라이언트 일관성 보장.
- 클라이언트 로케일/timezone 반영 → client 함수. "use client" 필요.
- 서버에서 렌더링된 HTML 그대로 → server 함수.
- 상대 시간(실시간 갱신) → `useRelativeDateTime` 훅.

**전체 datetime 함수 로직 요약:**
1. `toDate(value)`로 DateInput → Date | null 변환 (유효성 검사)
2. 선택적으로 `toUtcMidnight`로 UTC 자정 정규화
3. `normalizeAppLocale(locale)`로 AppLocale 결정
4. `Intl.DateTimeFormat.formatToParts` 또는 `Intl.DateTimeFormat.format`으로 포맷
5. 한국어/일본어는 커스텀 포맷팅 (toParts로 각 컴포넌트 추출 후 조립), 영어는 Intl 네이티브 포맷 사용
