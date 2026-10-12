# Getting started

[English](./getting-started.md) | [한국어](../ko/getting-started.md)

## Requirements

- Node.js 20 or newer for development/tooling.
- React 19 for React hooks and components.
- Any modern ESM-aware bundler or framework. Next.js works without `transpilePackages` because the npm package ships compiled JavaScript and declarations.

## Install

```bash
npm install @musecat/functionkit
```

Bun and pnpm work as well:

```bash
bun add @musecat/functionkit
pnpm add @musecat/functionkit
```

## Import from the package root

```ts
import { debounce, isHttpUrl } from "@musecat/functionkit";
```

The explicit Web entry is equivalent today:

```ts
import { useDebounce } from "@musecat/functionkit/web";
```

Prefer the root entry unless seeing `/web` in the import helps communicate a platform boundary in your codebase.

## Client hooks in Next.js

Client-only hooks still follow normal React/Next rules. Put the consumer behind a client boundary:

```tsx
"use client";

import { useDebounce } from "@musecat/functionkit";
import { useEffect, useState } from "react";

export function SearchPreview({ value }: { value: string }) {
	const [settled, setSettled] = useState(value);
	const updateSettled = useDebounce(setSettled, 200);
	useEffect(() => updateSettled(value), [updateSettled, value]);
	return <span>{settled}</span>;
}
```

You do not need to mark universal helpers as client code:

```ts
import { isEmailAddress, normalizeHostname } from "@musecat/functionkit";

export function normalizeRecipient(value: string) {
  if (!isEmailAddress(value)) return null;
  return value.trim().toLowerCase();
}
```

## Find the right API

Use the [API map](./api.md) for discovery. When you need exact defaults or cleanup behavior, open the matching file under [`references/`](../../references/README.md). The generated [`publicApi.manifest.json`](../../publicApi.manifest.json) connects every exported symbol to its source, runtime classification, and reference document.

## What FunctionKit does not own

FunctionKit deliberately avoids application policy. Persistence keys, locale policy, business thresholds, provider credentials, translated copy, and product-specific data stay in the consuming application. The public Web artifact is built only from `web/packages/**`; `web/musecat/**` never enters the npm release graph.
