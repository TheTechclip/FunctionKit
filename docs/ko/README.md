# FunctionKit 문서

[한국어](./README.md) | [English](../en/README.md)

처음 보는 분이라면 아래 순서로 읽는 편이 빠릅니다.

1. [시작하기](./getting-started.md) — 설치부터 첫 import까지.
2. [API 한눈에 보기](./api.md) — 파일 경로가 아니라 기능 기준으로 찾습니다.
3. [Runtime과 SSR](./runtime.md) — Universal, Client-only, fallback 규칙을 설명합니다.
4. [실전 조합 예제](./recipes.md) — 여러 primitive를 함께 쓰는 방법을 모았습니다.
5. [1.x에서 2.0으로 옮기기](./migration-v2.md) — 마지막 1.x 배포본인 `1.3.7`과 달라진 점을 정리합니다.
6. [배포 구조](./releases.md) — 현재 Web npm 배포와 이후 Android/Apple 배포 경계를 설명합니다.

정확한 시그니처와 예외 처리, cleanup 규칙이 필요하면 [`publicApi.manifest.json`](../../publicApi.manifest.json)에서 해당 심볼의 reference를 따라가세요.
