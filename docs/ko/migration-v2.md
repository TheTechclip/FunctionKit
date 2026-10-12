# 1.x에서 2.0으로 옮기기

[한국어](./migration-v2.md) | [English](../en/migration-v2.md)

기존 npm 배포는 `@musecat/functionkit@1.3.7`에서 멈춰 있었습니다. 2.0은 같은 패키지 이름을 이어가지만 공개 범위를 다시 정리한 메이저 릴리스입니다.

## 왜 2.0인가요?

1.x에는 범용 유틸리티와 함께 서비스 전용 날짜·locale·표시 정책이 섞여 있었고, npm entry도 원시 TypeScript를 직접 가리켰습니다. 2.0은 제품 정책을 공개 Web artifact에서 빼고 컴파일된 ESM과 `.d.ts`를 배포합니다.

따라서 patch처럼 올리기보다 import를 한 번 점검하고 넘어가는 게 안전합니다.

## 설치 후 import

1.x와 2.0 모두 기본 import 모양은 같습니다.

```ts
import { useDebounce } from "@musecat/functionkit";
```

차이는 설치된 패키지 내부입니다. 2.0은 JavaScript로 컴파일된 파일을 가리키므로 FunctionKit 때문에 `transpilePackages`를 추가할 필요가 없습니다.

## 이름이나 역할이 바뀐 API

| 1.x 또는 기존 내부 API | 2.0 | 바꾼 이유 |
| --- | --- | --- |
| `ScrolltoTop` | `ScrollTo` | top만 강제하지 않고 목적지를 직접 정하도록 변경 |
| `useLayerBrightness` | `useLayerLuminance` | dark/light 판단 대신 측정값 자체를 반환 |
| `resolveLayerDarkness` | `resolveLuminanceThreshold` | threshold를 앱이 소유하도록 변경 |
| 고정 key를 가진 read/seen 계열 | `readState` core + cookie/storage adapter | 직렬화와 저장 방식을 분리하고 key 소유권을 앱으로 이동 |

## 공개 Web 패키지에서 빠진 항목

서비스에 종속된 date/time, locale mapping, currency/provider 로직, geography/media 정책, Musecat 전용 hook은 2.0 npm artifact에 들어가지 않습니다. 1.x에서 이런 API를 썼다면 업그레이드 전에 해당 정책을 애플리케이션 코드로 옮기거나 별도 패키지로 분리해야 합니다.

공개 release graph는 `web/packages/**`만 따라갑니다. `web/musecat/**`은 내부 모노레포에서만 사용하며 공개 Web 배포 단계에서 제외됩니다.

## runtime 정보가 명시됩니다

모든 공개 심볼은 [`publicApi.manifest.json`](../../publicApi.manifest.json)에 runtime 분류를 갖습니다. React Server Component로 코드를 옮길 때는 Client-only API 여부를 먼저 확인하세요.

## 권장 업그레이드 순서

1. 별도 브랜치에서 2.0으로 올리고 TypeScript가 알려주는 삭제된 export부터 확인합니다.
2. 위 표에 있는 이름 변경을 먼저 처리합니다.
3. 1.x에서 라이브러리가 대신 갖고 있던 제품 정책을 애플리케이션 쪽으로 옮깁니다.
4. FunctionKit 때문에 넣었던 `transpilePackages` 설정이 있다면 제거합니다.
5. client test뿐 아니라 SSR/Server Component 경로도 함께 확인합니다.
6. 브라우저 API를 쓰는 기능은 해당 reference의 fallback과 cleanup 계약까지 읽어봅니다.
