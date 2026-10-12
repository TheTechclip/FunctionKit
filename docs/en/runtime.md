# Runtime and SSR

[English](./runtime.md) | [한국어](../ko/runtime.md)

Runtime classification is part of FunctionKit's public contract. The current classification for every symbol is recorded in [`publicApi.manifest.json`](../../publicApi.manifest.json).

## Universal

Universal APIs do not require browser-only globals and keep the same meaning on the server and in the browser.

Typical examples:

```ts
import {
  debounce,
  hasReadState,
  isHttpUrl,
  mergeRefs,
  parseReadState,
} from "@musecat/functionkit";
```

Importing a Universal helper does not create a client boundary in Next.js.

## Client-only

Client-only APIs need browser state, browser capabilities, or React client hooks. Their source keeps a `"use client"` boundary when needed.

Examples include:

- `useDebounce`
- `useViewportMatch`
- `useKeyboardHeight`
- `ViewportPortal`
- cookie/storage adapters
- browser event subscriptions

Use them from Client Components or other browser-owned code.

## Guarded browser fallback

A guarded API can be imported in server code without immediately reading browser globals. When the browser capability is unavailable it returns a documented fallback instead.

`getDeviceInfo` is the current example. Check its [reference](../../references/utils/browser/getDeviceInfo.md) before relying on server-side output.

## Types can have a different runtime than values

Some type-only exports are universal even when the runtime function that consumes them is client-only. The manifest records runtime per exported symbol rather than assuming one label for an entire file.

## SSR safety rules used by this project

1. Do not read `window`, `document`, `navigator`, or `localStorage` at module evaluation time for a Universal export.
2. Keep browser adapters explicit instead of hiding persistence or environment access inside pure helpers.
3. Keep product policy outside the library. For example, `useLayerLuminance` returns a measurement; the application chooses the threshold that turns it into a dark/light decision.
4. Treat the manifest and reference documents as part of the API. A runtime change requires documentation and tests in the same change.
