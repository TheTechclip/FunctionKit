# url

> 상태: Reference
>
> Runtime: Universal
>
> Public surface: `@musecat/functionkit/web` (`@musecat/functionkit`은 호환 alias)

**Source:** [`url.ts`](../../web/packages/utils/url.ts)
**Tests:** [`url.test.ts`](../../tests/utils/url.test.ts)

## 목적과 소유권

문자열 정리, URL parse, HTTP(S) 판별, 간단한 email 형태 검사, hostname 정규화/allow-list match를 제공한다. 네트워크 요청, URL 보안 정책 전체, RFC 완전 email validation은 소유하지 않는다.

## Public API

`toTrimmedString`, `toURL`, `isHttpUrl`, `isEmailAddress`, `normalizeHostname`, `hostMatchesAny`를 root/Web surface에서 공개한다.

## Runtime과 dependency

표준 `URL`과 문자열 연산만 사용하며 DOM/React에 의존하지 않는다. server/client JavaScript runtime에서 사용할 수 있다.

## 동작 계약

- `toTrimmedString`은 string만 trim하고 다른 타입은 빈 문자열로 바꾼다.
- `toURL`은 optional base를 지원하고 parse 실패 시 throw 대신 `null`을 반환한다.
- `isHttpUrl`은 absolute URL 중 `http:`/`https:`이고 hostname이 있는 경우만 true다.
- `isEmailAddress`는 trim 후 `local@dotted-domain` 형태를 확인하는 경량 검사이며 RFC mailbox parser가 아니다.
- `normalizeHostname`은 trim/lowercase 후 leading `www.`와 trailing `.` 하나를 제거한다.
- `hostMatchesAny`는 정규화 후 exact host 또는 진짜 subdomain suffix(`sub.example.com`)만 허용한다. `not-example.com`은 `example.com`에 match하지 않는다.

## 접근성

해당 없음 — 문자열 utility다.

## 오류와 cleanup

parse 실패는 `null`/`false`로 표현하며 lifecycle resource가 없다.

## 예제

```ts
import { hostMatchesAny, isHttpUrl } from "@musecat/functionkit";

if (isHttpUrl(input)) {
  const allowed = hostMatchesAny(new URL(input).hostname, ["example.com"]);
}
```

## 금지 패턴

- `isEmailAddress`를 RFC 전체를 검증하는 authoritative email validator로 사용하지 않는다.
- hostname allow-list 비교에 raw `endsWith("example.com")`를 직접 사용하지 않는다.
- invalid URL을 exception flow로 강제하기 위해 이 helper의 `null` 계약을 우회하지 않는다.

## 검증

`url.test.ts`가 relative URL+base, invalid URL, HTTP/FTP 구분, email 형태, hostname normalization, subdomain match와 lookalike host rejection을 검증한다.
