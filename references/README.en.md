# FunctionKit reference guide

[English](./README.en.md) | [한국어](./README.md)

`references/` contains source-aligned contract notes for the public Web API. For discovery, start with [`docs/en/api.md`](../docs/en/api.md). Use these references when you need exact defaults, failure behavior, cleanup ownership, runtime constraints, or implementation evidence.

## How to read the references

1. Find the symbol in [`publicApi.manifest.json`](../publicApi.manifest.json).
2. Check `runtime`, `source`, `surfaces`, and `reference`.
3. Open the linked reference and follow its Source/Tests evidence when changing behavior.
4. Keep implementation, tests, manifest, and reference documentation in the same change.

## Public surfaces

- `@musecat/functionkit` — default Web entry.
- `@musecat/functionkit/web` — explicit Web alias exposing the same public surface.

Physical paths under `web/packages/**` are implementation details and are not supported package subpaths.

## Runtime vocabulary

- **Universal** — same meaning on server and browser, without browser-only globals at module evaluation.
- **Client-only** — browser APIs or React client lifecycle required.
- **Guarded browser fallback** — safe server import with a documented fallback when browser capability is unavailable.

The generated manifest is authoritative for each exported symbol's runtime label.
