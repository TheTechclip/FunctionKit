# 배포 구조

공개 root/Web barrel은 React와 ReactDOM을 모두 필수 peer로 사용합니다. JavaScript와 선언 파일의 상대 import에는 `.js` 확장자를 명시하여 Node ESM·TypeScript NodeNext 해석을 일치시킵니다. packed-install smoke 검사는 Bundler·NodeNext 양쪽에서 선언 검사도 수행합니다. 배포본에는 LICENSE·CHANGELOG·기여 안내·비공개 취약점 신고 정책을 함께 포함합니다.

[한국어](./releases.md) | [English](../en/releases.md)

이 브랜치는 FunctionKit Web 배포를 관리하며 native 개발은 `dev/Native`에서 진행합니다.

| 플랫폼 | 소스 | 현재 상태 |
| --- | --- | --- |
| Web | `web/packages/**` | `@musecat/functionkit`으로 npm 배포 |
| Musecat 내부 Web | `web/musecat/**` | 공개 Web artifact에 절대 포함하지 않음 |

## Web 버전 규칙

npm 패키지는 기존 `1.3.7`의 명맥을 이어가며, 새 공개 경계를 적용한 첫 버전은 `2.0.0`입니다.

Web 릴리스 태그는 아래처럼 플랫폼 이름을 붙입니다.

```text
web-v2.0.0
web-v2.1.0
```

이렇게 두면 나중에 Android와 Apple이 서로 다른 주기로 배포돼도 모든 플랫폼 버전을 억지로 맞출 필요가 없습니다.

## Web 배포 전에 확인하는 것

1. lint와 TypeScript 검사
2. 공개 Web 코드 coverage 100%
3. public API manifest와 reference 정합성
4. `web/musecat/**`이 release graph에 섞이지 않았는지 검사
5. ESM과 `.d.ts` 컴파일
6. 실제 tarball을 빈 프로젝트에 설치한 뒤 bare import smoke test

GitHub Actions 배포는 npm Trusted Publishing을 기준으로 구성합니다. 첫 릴리스 전에 npm 패키지 설정에서 `TheTechclip/FunctionKit`과 실제 publish workflow 파일명을 Trusted Publisher로 등록해야 합니다. OIDC를 쓰면 장기 publish token을 저장하지 않아도 되고, 공개 저장소와 공개 패키지에서는 provenance도 자동으로 붙습니다.

## 로컬에서 확인하기

```bash
bun install --frozen-lockfile
bun run check:web
bun run pack:web
```

원본 workspace는 계속 `private: true`로 둡니다. `pack:web`과 publish workflow는 공개 graph만 새 staging 디렉터리에 만든 뒤 그 결과물을 사용합니다. 저장소 루트에서 실수로 전체 내부 소스를 publish하는 일을 막기 위한 장치입니다.

## Android와 Apple

Android와 Apple 소스·검증·배포 프로필은 `dev/Native`에서 관리합니다. 이 브랜치와 생성한 공개 저장소에는 Web 소스와 도구만 포함합니다.
