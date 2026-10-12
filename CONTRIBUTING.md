# Contributing to FunctionKit

[English](./CONTRIBUTING.md) | [한국어](./CONTRIBUTING.ko.md)

This branch maintains public Web and Musecat-private Web code. Android and Apple implementations are maintained on `dev/Native`.

## Setup

```bash
bun install --frozen-lockfile
```

## Before changing a Web API

1. Check [`publicApi.manifest.json`](./publicApi.manifest.json) and the linked reference document.
2. Keep product-neutral public code under `web/packages/**`.
3. Put Musecat-only policy or provider integration under `web/musecat/**`; public Web entries must never depend on it.
4. Update implementation, tests, reference docs, and public exports together.
5. Preserve the runtime contract. A Universal API must not start reading browser globals during module evaluation.

## Validation

```bash
bun run check:web
```

That command runs lint, type checking, 100% public coverage, reference/manifest checks, and a packed-install smoke test.

Internal maintainers can additionally run Musecat coverage:

```bash
bun run test:coverage:musecat
```

Android and Apple development and validation are maintained on `dev/Native`.

## Documentation

User-facing guides are bilingual under `docs/en` and `docs/ko`. Keep both languages aligned when behavior, installation, runtime constraints, or release policy changes. Symbol-level `references/` documents are source-aligned contract notes; the TypeScript definitions and tests remain the final executable authority.

## Pull requests

A PR that changes public behavior should explain:

- what changed for consumers;
- whether the runtime classification changed;
- whether the change is breaking;
- which tests and documentation were updated.

Do not mix unrelated product policy into a FunctionKit API just to make one application call site shorter.

## Security

Please report vulnerabilities through [SECURITY.md](./SECURITY.md) instead of a public issue.
