# browserStorage

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`browserStorage.ts`](../../../web/packages/utils/browser/browserStorage.ts)
**Tests:** [`browserStorage.test.ts`](../../../tests/utils/browserStorage.test.ts)

## 목적과 소유권

Provides JSON-serialized read/write/delete access to `localStorage` and `sessionStorage`. The caller owns the persistence key and validates the `unknown` read value before use.

## 동작 계약

Each function wraps the native Storage API with `JSON.stringify`/`JSON.parse`. Missing `window`, a throwing storage getter (for example restricted browser storage), failed native operations, and invalid JSON preserve the existing fallback: reads return `null`, writes/deletes silently do nothing. These best-effort adapters do not change `readState`'s injected storage-adapter error propagation.

## Public API

```ts
// localStorage
function getLocalStorage(key: string): unknown;
function updateLocalStorage(key: string, value: unknown): void;
function removeLocalStorage(key: string): void;

// sessionStorage
function getSessionStorage(key: string): unknown;
function updateSessionStorage(key: string, value: unknown): void;
function removeSessionStorage(key: string): void;
```

## 예제

```ts
import { getLocalStorage, updateLocalStorage, removeLocalStorage } from "@musecat/functionkit/web";

// Call from a client event handler/effect, not during server rendering.
updateLocalStorage("draft", "Hello");
const stored = getLocalStorage("draft");
const draft = typeof stored === "string" ? stored : "";
removeLocalStorage("draft");
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성

해당 없음 — 이 reference의 API는 독립적인 interactive semantic surface를 직접 렌더링하지 않는다.

## 오류와 cleanup

No listeners or timers are retained and no unsubscribe is needed. The caller owns deletion of its key; a completed write does not guarantee persistence when browser storage is unavailable.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`browserStorage.test.ts`](../../../tests/utils/browserStorage.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
