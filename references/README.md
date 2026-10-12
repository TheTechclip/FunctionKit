# FunctionKit reference 안내

[한국어](./README.md) | [English](./README.en.md)

`references/`는 공개 Web API의 세부 동작을 소스와 가깝게 기록하는 문서입니다. 처음 API를 찾을 때는 [`docs/ko/api.md`](../docs/ko/api.md)를 보고, 기본값·실패 처리·cleanup·runtime 제약처럼 정확한 계약이 필요할 때 이 문서를 따라오면 됩니다.

## 읽는 순서

1. [`publicApi.manifest.json`](../publicApi.manifest.json)에서 심볼을 찾습니다.
2. `runtime`, `source`, `surfaces`, `reference`를 확인합니다.
3. 연결된 reference에서 Source/Tests 근거와 실제 동작 계약을 읽습니다.
4. 공개 동작을 바꿀 때 구현, 테스트, manifest, reference를 같은 변경에서 함께 갱신합니다.

## 공개 surface

- `@musecat/functionkit` — 기본 Web entry
- `@musecat/functionkit/web` — 같은 Web surface를 명시적으로 가리키는 alias

`web/packages/**`의 실제 파일 경로는 구현 세부사항이며 package subpath로 지원하지 않습니다.

## Runtime 용어

- **Universal** — 서버와 브라우저에서 같은 의미로 동작하며 모듈 평가 시점에 브라우저 전역 객체를 요구하지 않습니다.
- **Client-only** — 브라우저 API 또는 React client lifecycle이 필요합니다.
- **Guarded browser fallback** — 서버 import는 안전하고 브라우저 기능이 없을 때 문서에 적힌 fallback을 사용합니다.

각 export의 최종 runtime 분류는 자동 생성되는 manifest가 정본입니다.

## 유지보수

`bun run manifest`는 공개 entry에서 manifest를 다시 만들고, `bun run references`는 manifest freshness와 모든 reference 연결을 검사합니다. 공개 export를 추가하면서 reference가 없거나, 문서만 바꾸고 manifest를 갱신하지 않은 상태는 CI에서 실패합니다.
