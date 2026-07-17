# seen

## Purpose

Manages a "user has already seen this" state as a JSON string. Useful for marking items as read, dismissing onboarding prompts, or tracking feature discovery without server state.

## Usage Logic

Stores an array of string keys serialized as JSON. `parseSeen` deserializes, `hasSeenKey` checks a specific key, and `buildSeenValue` appends a new key and returns the updated JSON string. SSR-safe — pure functions with no side effects.

## Type Signatures

```ts
const SEEN_STORAGE_KEY = "seen";

function parseSeen(seen: string | null): string[];
function hasSeenKey(seen: string | null, key: string): boolean;
function buildSeenValue(prev: string | null, key: string): string;
```

## Example Code

```tsx
import { hasSeenKey, buildSeenValue, SEEN_STORAGE_KEY } from "@musecat/functionkit";
import { getLocalStorage, updateLocalStorage } from "@musecat/functionkit";

function useOnboarding() {
  const stored = getLocalStorage(SEEN_STORAGE_KEY);
  const hasSeenWalkthrough = hasSeenKey(stored, "walkthrough-v1");

  const dismissWalkthrough = () => {
    updateLocalStorage(SEEN_STORAGE_KEY, buildSeenValue(stored, "walkthrough-v1"));
  };

  return { hasSeenWalkthrough, dismissWalkthrough };
}
```
