# readState

> 상태: Reference
>
> Runtime: Universal
>
> Public surface: `@musecat/functionkit/web` (root is the compatibility alias)

**Sources:** [`readState.ts`](../../web/packages/utils/readState.ts), [`readState.cookie.client.ts`](../../web/packages/utils/browser/readState.cookie.client.ts), [`readState.storage.client.ts`](../../web/packages/utils/browser/readState.storage.client.ts)
**Tests:** [`readState.test.ts`](../../tests/utils/readState.test.ts)

## 목적과 소유권

읽음 ID 집합의 serialization contract와 persistence adapter를 분리한다. core는 저장 위치나 key를 알지 않으며, application이 cookie/localStorage/sessionStorage 등의 backend와 key를 선택한다.

## Public API

```ts
type HasReadStateOptions = { readWhenValuesPresent?: Iterable<string | null | undefined> };
function parseReadState(raw: string | null): Set<string>;
function hasReadState(raw: string | null, itemId: string, options?: HasReadStateOptions): boolean;
function markReadState(raw: string | null, itemIds: Iterable<string>): string;

interface CookieReadStateOptions { key: string; days?: number }
function getCookieReadState(options: CookieReadStateOptions): string | null;
function hasCookieReadState(itemId: string, options: CookieReadStateOptions & HasReadStateOptions): boolean;
function markCookieReadState(itemIds: Iterable<string>, options: CookieReadStateOptions): string;

type ReadStateStorage = Pick<Storage, "getItem" | "setItem">;
function getStorageReadState(storage: ReadStateStorage, key: string): string | null;
function hasStorageReadState(storage: ReadStateStorage, key: string, itemId: string, options?: HasReadStateOptions): boolean;
function markStorageReadState(storage: ReadStateStorage, key: string, itemIds: Iterable<string>): string;
```

## Runtime과 dependency

core `readState.ts`는 Universal이다. cookie/storage adapter는 Client-only이며 각각 browser cookie API와 Storage-like object를 사용한다.

## 동작 계약

serialized shape는 `{ [itemId]: true }` JSON이다. URL-encoded JSON도 parse한다. invalid input은 빈 Set으로 취급한다. mark는 기존 ID를 보존하고 공백 ID를 제거한다. package는 persistence key를 예약하지 않는다.

## 접근성

DOM을 렌더링하지 않는다. 읽음 상태의 시각/ARIA 표현은 소비자가 소유한다.

## 오류와 cleanup

parse 실패는 throw하지 않고 빈 상태로 fallback한다. storage/cookie의 platform-specific 제한은 해당 adapter와 underlying browser API 계약을 따른다.

## 예제

```ts
const raw = getCookieReadState({ key: "read-items" });
const seen = hasReadState(raw, "welcome");
markCookieReadState(["welcome"], { key: "read-items", days: 365 });

markStorageReadState(localStorage, "read-items", ["welcome"]);
```

## 금지 패턴

- FunctionKit이 `read-items` 같은 application key를 상수로 소유하지 않는다.
- core serialization 함수에서 document/window를 읽지 않는다.

## 검증

core parsing/marking은 위 test가 검증한다. cookie/storage adapter는 public coverage에서 browser adapter 계약을 함께 검증한다.
