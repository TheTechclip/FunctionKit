# Cookie API

> 상태: Reference
>
> Runtime: Mixed
>
> Public surface: `@musecat/functionkit/web` (`@musecat/functionkit`은 호환 alias)

**Source:** [`cookie.client.ts`](../../../web/packages/utils/browser/cookie.client.ts), [`parseCookieNames.ts`](../../../web/packages/utils/parseCookieNames.ts)
**Tests:** [`cookie.test.ts`](../../../tests/cookie/cookie.test.ts)

## 목적과 소유권

Web cookie의 client-side read/write/delete와 cookie header 문자열에서 name만 추출하는 pure parser를 한 계약으로 설명한다. cookie consent, authentication policy, server request header 접근, security attribute 정책 전체는 소유하지 않는다.

## Public API

- `getClientCookie`, `setClientCookie`, `clearClientCookie`, `clearAllClientCookies`는 client cookie API다.
- `parseClientCookieNames(cookieString)`는 DOM 없이 cookie name 배열만 추출하는 universal helper다.
- client mutation helper의 `documentRef`/`cookieStore` option은 browser adapter 주입과 테스트를 위한 경계다.

## Runtime과 dependency

이 reference는 **mixed runtime**이다. `cookie.client.ts`의 read/write/delete 값 API는 client-only이며 `document`/`window`가 없는 환경에서 읽기는 `undefined`, clear-all은 `[]`, mutation은 no-op으로 안전하게 빠진다. `parseClientCookieNames`는 pure string parser라 server에서도 사용할 수 있지만 현재 `/shared` entry에는 노출하지 않는다. 따라서 DataKit에서 이 Web reference를 import하지 않는다.

## 동작 계약

- `getClientCookie`는 `document.cookie`를 `;`로 분리하고 첫 `=`만 separator로 사용하므로 값 안의 `=`는 보존한다.
- cookie value는 `decodeURIComponent`를 시도하고 malformed encoding은 raw value를 그대로 반환한다.
- 값이 없는 cookie name은 empty string value로 읽고, 빈 name은 무시한다.
- `setClientCookie`는 value를 URI encode하고 `path=/`을 쓴다. truthy `days`가 있을 때만 `expires`를 추가하므로 `days=0`은 expiry를 만들지 않는다.
- `clearClientCookie`는 1970 expiry와 지정 path/domain으로 하나의 cookie variant를 만료시킨다.
- `clearAllClientCookies`는 현재 path를 기본으로 하고 `includeRoot`이면 `/`도 시도하며, hostname의 parent-domain 조합까지 만료시킨다.
- `cookieStore`가 주어지면 발견된 name 각각에 `delete`를 호출하고 async rejection은 이 synchronous API 결과에 전파하지 않는다.
- `cookieString` option이 있으면 `documentRef.cookie` 대신 해당 문자열의 name을 대상으로 한다.

## 접근성

해당 없음 — cookie/string utility이며 interactive UI를 생성하지 않는다.

## 오류와 cleanup

브라우저 전역 부재는 exception이 아닌 no-op/empty fallback으로 처리한다. malformed URI decoding도 raw value fallback이다. `cookieStore.delete` rejection은 의도적으로 무시한다. listener, timer, subscription을 만들지 않아 lifecycle cleanup은 없다.

## 예제

```ts
import {
  clearClientCookie,
  getClientCookie,
  parseClientCookieNames,
  setClientCookie,
} from "@musecat/functionkit/web";

const names = parseClientCookieNames("session=abc; theme=dark");
const session = getClientCookie("session");
setClientCookie("theme", "light", 30);
clearClientCookie("session");
```

## 금지 패턴

- Web cookie helper를 server request cookie API의 대체물로 사용하지 않는다.
- `parseClientCookieNames`가 value를 parse/validate한다고 가정하지 않는다.
- 인증 cookie의 `Secure`, `HttpOnly`, `SameSite` 정책을 이 generic client helper가 보장한다고 가정하지 않는다.
- application에서 parent-domain/path 삭제 loop를 다시 구현하지 않는다.

## 검증

`cookie.test.ts`가 parse, value decode/fallback, no-document guard, expiry/encoding, custom domain/path, clear-all path/domain traversal, injected cookie string과 Cookie Store failure를 검증한다. 변경 시 FunctionKit typecheck, public manifest와 reference audit를 함께 실행한다.
