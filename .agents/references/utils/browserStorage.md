# browserStorage

## Purpose

Provides typed JSON-serialized read/write/delete access to `localStorage` and `sessionStorage`. Gracefully handles missing `window` (SSR) by returning `null` silently.

## Usage Logic

Each function wraps the native Storage API with `JSON.stringify`/`JSON.parse`. SSR-safe at the call site — checks for `typeof window` before accessing storage.

## Type Signatures

```ts
// localStorage
function getLocalStorage<T = string>(key: string): T | null;
function updateLocalStorage<T>(key: string, value: T): void;
function removeLocalStorage(key: string): void;

// sessionStorage
function getSessionStorage<T = string>(key: string): T | null;
function updateSessionStorage<T>(key: string, value: T): void;
function removeSessionStorage(key: string): void;
```

## Example Code

```tsx
import { getLocalStorage, updateLocalStorage, removeLocalStorage } from "@musecat/functionkit";

function useDraft() {
  const draft = getLocalStorage<{ text: string }>("draft") ?? { text: "" };

  const saveDraft = (text: string) => {
    updateLocalStorage("draft", { text });
  };

  const clearDraft = () => removeLocalStorage("draft");

  return { draft, saveDraft, clearDraft };
}
```
