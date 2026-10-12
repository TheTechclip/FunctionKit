# FunctionKit에 기여하기

[한국어](./CONTRIBUTING.ko.md) | [English](./CONTRIBUTING.md)

이 브랜치는 공개 Web과 Musecat 내부 Web을 관리합니다. Android와 Apple 구현은 `dev/Native`에서 관리합니다.

## 개발 환경

```bash
bun install --frozen-lockfile
```

## Web API를 바꾸기 전에

1. [`publicApi.manifest.json`](./publicApi.manifest.json)에서 해당 심볼과 연결된 reference를 확인합니다.
2. 제품에 종속되지 않는 공개 코드는 `web/packages/**`에 둡니다.
3. Musecat 전용 정책이나 provider 연동은 `web/musecat/**`에 둡니다. 공개 Web entry가 이 경로를 의존하면 안 됩니다.
4. 구현, 테스트, reference, export를 한 변경에서 함께 고칩니다.
5. runtime 계약을 지킵니다. Universal API가 모듈 평가 시점에 브라우저 전역 객체를 읽기 시작하면 안 됩니다.

## 검증

```bash
bun run check:web
```

이 명령 하나로 lint, typecheck, 공개 코드 coverage 100%, manifest/reference 검사, 실제 tarball 설치 smoke test까지 확인합니다.

내부 개발에서는 Musecat 전용 coverage도 따로 돌립니다.

```bash
bun run test:coverage:musecat
```

Android와 Apple 개발·검증은 `dev/Native`에서 진행합니다.

## 문서

사용자 문서는 `docs/en`, `docs/ko`에 같은 구조로 둡니다. 설치법, runtime 제약, 공개 동작, 배포 방식이 바뀌면 두 언어 문서를 같이 수정합니다. `references/`는 소스와 가까운 세부 계약 문서이며, 실제 타입 정의와 테스트가 최종 실행 정본입니다.

## Pull Request

공개 동작을 바꾸는 PR에는 아래 내용을 적어주세요.

- 사용자가 체감하는 변화
- runtime 분류 변화 여부
- breaking change 여부
- 함께 고친 테스트와 문서

한 서비스의 호출 코드를 짧게 만들기 위해 제품 정책을 FunctionKit으로 끌어올리는 변경은 받지 않습니다.

## 보안

취약점은 공개 issue 대신 [SECURITY.md](./SECURITY.md)의 안내에 따라 제보해주세요.
