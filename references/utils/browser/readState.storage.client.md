# readState.storage.client

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web` (root is the compatibility alias)

**Source:** [`readState.storage.client.ts`](../../../web/packages/utils/browser/readState.storage.client.ts)
**Tests:** [`readState.adapters.test.ts`](../../../tests/utils/readState.adapters.test.ts)

## 목적과 소유권

read-state core를 Storage-compatible persistence에 연결한다. localStorage/sessionStorage 또는 호환 adapter와 key는 소비자가 주입한다.

## Public API

```ts
type ReadStateStorage = Pick<Storage, "getItem" | "setItem">;
function getStorageReadState(storage: ReadStateStorage, key: string): string | null;
function hasStorageReadState(storage: ReadStateStorage, key: string, itemId: string, options?: HasReadStateOptions): boolean;
function markStorageReadState(storage: ReadStateStorage, key: string, itemIds: Iterable<string>): string;
```

## Runtime과 dependency

Client-only adapter지만 explicit Storage-like object를 받으므로 global localStorage를 직접 읽지 않는다.

## 동작 계약

get은 지정 key의 raw value를 반환한다. mark는 기존 raw state를 병합하고 `setItem`으로 저장한 뒤 serialization을 반환한다.

## 접근성

DOM surface를 만들지 않는다.

## 오류와 cleanup

Storage quota/security 예외는 숨기지 않는다. 호출자가 persistence failure policy를 결정한다.

## 예제

```ts
markStorageReadState(localStorage, "read-items", ["welcome"]);
```

## 금지 패턴

- adapter 내부에서 storage 종류나 key를 고정하지 않는다.
- persistence failure를 성공으로 위장하지 않는다.

## 검증

adapter test가 get/has/mark와 storage injection을 검증한다.
