# readState.cookie.client

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web` (root is the compatibility alias)

**Source:** [`readState.cookie.client.ts`](../../../web/packages/utils/browser/readState.cookie.client.ts)
**Tests:** [`readState.adapters.test.ts`](../../../tests/utils/readState.adapters.test.ts)

## 목적과 소유권

read-state core를 browser cookie persistence에 연결한다. cookie key와 retention 기간은 소비자가 소유한다.

## Public API

```ts
interface CookieReadStateOptions { key: string; days?: number }
function getCookieReadState(options: CookieReadStateOptions): string | null;
function hasCookieReadState(itemId: string, options: CookieReadStateOptions & HasReadStateOptions): boolean;
function markCookieReadState(itemIds: Iterable<string>, options: CookieReadStateOptions): string;
```

## Runtime과 dependency

Client-only. FunctionKit의 client cookie utility와 Universal `readState` core를 사용한다.

## 동작 계약

get은 지정 key의 cookie raw value를 반환한다. mark는 기존 상태를 병합한 JSON을 같은 key에 저장하고 그 문자열을 반환한다. `days`는 cookie retention에 전달된다.

## 접근성

DOM surface를 만들지 않는다.

## 오류와 cleanup

브라우저 cookie가 없는 runtime에서는 underlying cookie utility의 no-op/fallback 계약을 따른다.

## 예제

```ts
markCookieReadState(["welcome"], { key: "read-items", days: 365 });
```

## 금지 패턴

- library-owned 고정 cookie key를 추가하지 않는다.
- server cookie store와 혼용하지 않는다.

## 검증

adapter test가 get/has/mark와 key 전달을 검증한다.
