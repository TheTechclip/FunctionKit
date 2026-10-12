# FunctionKit

[English](./README.md) | [한국어](./README.ko.md)

Small, runtime-aware utilities for React and the Web.

FunctionKit collects hooks, browser adapters, and universal helpers that are useful across applications without carrying product policy with them. Web development is maintained on `main`; Android and Apple implementations are maintained on `dev/Native`.

## Install

```bash
npm install @musecat/functionkit
# or
bun add @musecat/functionkit
```

React 19 and ReactDOM 19 are required peer dependencies: the root barrel includes `ViewportPortal`, even when a consumer selects a universal helper. The package ships compiled ESM and TypeScript declarations for Bundler and NodeNext resolution, so consumers do not need `transpilePackages` or a package-specific build step.

## Start in 60 seconds

```tsx
"use client";

import { useDebounce, useViewportMatch } from "@musecat/functionkit";
import { useEffect, useState } from "react";

export function SearchStatus({ query }: { query: string }) {
	const [debouncedQuery, setDebouncedQuery] = useState(query);
	const updateQuery = useDebounce(setDebouncedQuery, 250);
	const compact = useViewportMatch("(max-width: 640px)");
	useEffect(() => updateQuery(query), [query, updateQuery]);

  return (
    <p>
      {compact ? "Query" : "Current query"}: {debouncedQuery}
    </p>
  );
}
```

Universal helpers use the same root import:

```ts
import { debounce, isHttpUrl, mergeRefs } from "@musecat/functionkit";
```

`@musecat/functionkit/web` is also available when you want the platform to be explicit. It exposes the same Web surface as the root entry.

## What is included

| Area | Examples |
| --- | --- |
| State and interaction | `useControllableState`, `useCollectionSelection`, `useToggleState`, `useLongPress` |
| Timing | `debounce`, `useDebounce`, `useDebouncedCallback`, `useInterval`, `useTimeout` |
| Keyboard and viewport | `useKeyboardListNavigation`, `useKeyboardHeight`, `useViewportMatch`, `useViewportHeight` |
| Browser adapters | cookies, local/session storage, clipboard/share, viewport subscriptions, read-state persistence |
| Rendering helpers | `SwitchCase`, `ViewportPortal`, `ScrollTo` |
| Utility primitives | URL helpers, `mergeRefs`, memory history, context builder, Escape dismissal coordination |
| Surface analysis | `useLayerLuminance`, `resolveLuminanceThreshold` |

The generated [public API manifest](./publicApi.manifest.json) is the complete symbol inventory. Detailed contracts live in [references](./references/README.md).

## Runtime model

FunctionKit does not pretend every export works everywhere. Each public symbol is classified as one of:

- **Universal** — safe in server and browser runtimes with the same meaning.
- **Client-only** — requires React client state/effects or browser APIs.
- **Guarded browser fallback** — safe to import on the server, but browser capabilities have an explicit fallback.

See [Runtime and SSR](./docs/en/runtime.md) before using browser-facing APIs in Server Components.

## Documentation

- [Getting started](./docs/en/getting-started.md)
- [API map](./docs/en/api.md)
- [Runtime and SSR](./docs/en/runtime.md)
- [Recipes](./docs/en/recipes.md)
- [Migrating from 1.x](./docs/en/migration-v2.md)
- [Release model](./docs/en/releases.md)
- [Contributing](./CONTRIBUTING.md)

Korean documentation starts at [docs/ko](./docs/ko/README.md).

## Repository layout

```text
web/packages/      Public Web implementation
web/musecat/       Private Musecat-only implementation; never included in the public Web artifact
references/        Symbol-level Web contracts
scripts/           Manifest, release, and smoke-test tooling
```

This branch contains Web source and tooling. Native development continues on `dev/Native` with independent API and release boundaries.

## Version 2

The last historical npm release was `1.3.7`. Version 2 resumes the same package lineage while drawing a stricter public/private boundary and publishing compiled ESM instead of raw TypeScript. Several application-specific 1.x APIs were intentionally removed or generalized. See the [2.0 migration guide](./docs/en/migration-v2.md).

## License

MIT © 2026 Musecat Team. See [LICENSE](./LICENSE) for the retained copyright notice.
