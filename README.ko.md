# FunctionKit

[한국어](./README.ko.md) | [English](./README.md)

React와 웹에서 자주 필요한 기능을 작고 독립적인 단위로 모은 유틸리티 라이브러리입니다.

FunctionKit은 특정 서비스의 정책을 품지 않습니다. 상태 관리 훅, 브라우저 API 어댑터, 서버와 클라이언트에서 함께 쓸 수 있는 순수 유틸리티를 한곳에서 제공합니다. Web 개발은 `main`에서, Android와 Apple 구현은 `dev/Native`에서 관리합니다.

## 설치

```bash
npm install @musecat/functionkit
# 또는
bun add @musecat/functionkit
```

React 19와 ReactDOM 19는 필수 peer dependency입니다. 순수 함수만 사용하더라도 루트 barrel이 `ViewportPortal`을 포함하기 때문입니다. 배포본에는 Bundler·NodeNext에서 사용할 수 있는 컴파일된 ESM과 TypeScript 선언 파일이 들어가므로 `transpilePackages` 같은 추가 설정 없이 바로 import할 수 있습니다.

## 1분 만에 시작하기

```tsx
"use client";

import { useDebounce, useViewportMatch } from "@musecat/functionkit";
import { useEffect, useState } from "react";

export function SearchStatus({ query }: { query: string }) {
	const [debouncedQuery, setDebouncedQuery] = useState(query);
	const updateQuery = useDebounce(setDebouncedQuery, 250);
	const compact = useViewportMatch("(max-width: 640px)");
	useEffect(() => updateQuery(query), [query, updateQuery]);

  return (
    <p>
      {compact ? "검색어" : "현재 검색어"}: {debouncedQuery}
    </p>
  );
}
```

서버에서도 쓸 수 있는 순수 함수 역시 같은 경로에서 가져옵니다.

```ts
import { debounce, isHttpUrl, mergeRefs } from "@musecat/functionkit";
```

플랫폼을 코드에 드러내고 싶다면 `@musecat/functionkit/web`을 써도 됩니다. 현재는 루트와 같은 Web API를 노출합니다.

## 무엇이 들어 있나요?

| 영역 | 예시 |
| --- | --- |
| 상태·상호작용 | `useControllableState`, `useCollectionSelection`, `useToggleState`, `useLongPress` |
| 타이밍 | `debounce`, `useDebounce`, `useDebouncedCallback`, `useInterval`, `useTimeout` |
| 키보드·뷰포트 | `useKeyboardListNavigation`, `useKeyboardHeight`, `useViewportMatch`, `useViewportHeight` |
| 브라우저 어댑터 | 쿠키, local/session storage, clipboard/share, viewport 구독, 읽음 상태 저장 |
| 렌더링 보조 | `SwitchCase`, `ViewportPortal`, `ScrollTo` |
| 범용 유틸리티 | URL 처리, `mergeRefs`, 메모리 히스토리, Context 생성, Escape dismissal 조정 |
| 화면 분석 | `useLayerLuminance`, `resolveLuminanceThreshold` |

전체 공개 심볼은 자동 생성되는 [public API manifest](./publicApi.manifest.json)에서 확인할 수 있습니다. 각 API의 동작 계약과 예외, 정리(cleanup) 규칙은 [references](./references/README.md)에 정리돼 있습니다.

## 런타임 구분

FunctionKit은 모든 함수를 어디서나 쓸 수 있는 것처럼 포장하지 않습니다. 공개 API마다 실행 환경을 구분합니다.

- **Universal** — 서버와 브라우저에서 같은 의미로 동작합니다.
- **Client-only** — React client state/effect 또는 브라우저 API가 필요합니다.
- **Guarded browser fallback** — 서버에서 import해도 안전하지만 브라우저 기능이 없을 때 정해진 fallback을 반환합니다.

Server Component에서 브라우저 기능을 쓸 예정이라면 [Runtime과 SSR](./docs/ko/runtime.md)을 먼저 읽어보세요.

## 문서

- [시작하기](./docs/ko/getting-started.md)
- [API 한눈에 보기](./docs/ko/api.md)
- [Runtime과 SSR](./docs/ko/runtime.md)
- [실전 조합 예제](./docs/ko/recipes.md)
- [1.x에서 2.0으로 옮기기](./docs/ko/migration-v2.md)
- [배포 구조](./docs/ko/releases.md)
- [기여하기](./CONTRIBUTING.ko.md)

영어 문서는 [docs/en](./docs/en/README.md)에서 시작할 수 있습니다.

## 저장소 구조

```text
web/packages/      외부에 배포하는 Web 구현
web/musecat/       Musecat 내부 전용 구현. 공개 Web artifact에는 포함하지 않음
references/        Web API별 세부 계약 문서
scripts/           manifest, release, smoke-test 도구
```

이 브랜치는 Web 소스와 도구를 관리합니다. Native 개발은 `dev/Native`에서 독립적인 API·배포 경계로 진행합니다.

## Version 2

npm에 마지막으로 올라간 버전은 `1.3.7`입니다. 2.0은 같은 `@musecat/functionkit` 패키지의 명맥을 이어가되 공개 범위를 다시 정리한 릴리스입니다. 원시 TypeScript 대신 컴파일된 ESM을 배포하고, 1.x에 섞여 있던 애플리케이션 전용 API는 제거하거나 더 범용적인 형태로 바꿨습니다. 자세한 내용은 [2.0 마이그레이션 가이드](./docs/ko/migration-v2.md)를 참고하세요.

## 라이선스

MIT © 2026 Musecat Team. 원래 저작권 표기는 [LICENSE](./LICENSE)에 보존합니다.
