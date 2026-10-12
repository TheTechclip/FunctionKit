# 시작하기

[한국어](./getting-started.md) | [English](../en/getting-started.md)

## 준비 사항

- 개발과 도구 실행에는 Node.js 20 이상을 권장합니다.
- React 훅과 컴포넌트를 쓸 때는 React 19가 필요합니다.
- ESM을 지원하는 현대적인 번들러라면 별도 설정 없이 사용할 수 있습니다. npm 배포본에는 JavaScript와 타입 선언이 함께 들어가므로 Next.js에서도 `transpilePackages`를 추가할 필요가 없습니다.

## 설치

```bash
npm install @musecat/functionkit
```

Bun이나 pnpm을 써도 됩니다.

```bash
bun add @musecat/functionkit
pnpm add @musecat/functionkit
```

## 루트에서 바로 가져오기

```ts
import { debounce, isHttpUrl } from "@musecat/functionkit";
```

Web 플랫폼을 import 경로에 드러내고 싶다면 아래 경로를 쓸 수 있습니다. 현재 두 entry가 제공하는 API는 같습니다.

```ts
import { useDebounce } from "@musecat/functionkit/web";
```

특별한 이유가 없다면 루트 import를 권장합니다.

## Next.js에서 client hook 쓰기

브라우저 기능이나 React client state를 사용하는 훅은 평소 Next.js 규칙대로 client boundary 안에서 호출하면 됩니다.

```tsx
"use client";

import { useDebounce } from "@musecat/functionkit";
import { useEffect, useState } from "react";

export function SearchPreview({ value }: { value: string }) {
	const [settled, setSettled] = useState(value);
	const updateSettled = useDebounce(setSettled, 200);
	useEffect(() => updateSettled(value), [updateSettled, value]);
	return <span>{settled}</span>;
}
```

순수 유틸리티를 쓰기 위해 client component로 바꿀 필요는 없습니다.

```ts
import { isEmailAddress, normalizeHostname } from "@musecat/functionkit";

export function normalizeRecipient(value: string) {
  if (!isEmailAddress(value)) return null;
  return value.trim().toLowerCase();
}
```

## API 찾는 법

무엇을 써야 할지 찾을 때는 [API 한눈에 보기](./api.md)부터 보는 편이 빠릅니다. 기본값, 실패 처리, observer나 timer 정리 방식처럼 세부 계약이 필요하면 [`references/`](../../references/README.md)를 확인하세요. 자동 생성되는 [`publicApi.manifest.json`](../../publicApi.manifest.json)에는 모든 공개 심볼의 source, runtime, reference가 연결돼 있습니다.

## FunctionKit이 맡지 않는 것

저장 key, locale 정책, 서비스 고유 threshold, 외부 provider 인증정보, 번역 문구, 비즈니스 데이터는 소비 애플리케이션이 소유합니다. 공개 Web artifact는 `web/packages/**`에서만 만들어지며 `web/musecat/**`은 npm 배포 그래프에 들어가지 않습니다.
