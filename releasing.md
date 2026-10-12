# FunctionKit maintainer release guide

User-facing release documentation lives in [`docs/en/releases.md`](./docs/en/releases.md) and [`docs/ko/releases.md`](./docs/ko/releases.md). This file records the maintainer procedure.

## Web / npm

The npm package is `@musecat/functionkit`. Version 2 resumes the historical package line after `1.3.7`.

The source workspace remains `private: true`. Never run `npm publish` from the repository root. A release is always created through the curated `web` profile:

```bash
bun run check:web
bun run pack:web
```

The release graph starts at `web/public.ts` and permits dependencies only under `web/packages/**`. Any dependency on `web/musecat/**` fails before staging. The staged package compiles the selected graph to ESM + `.d.ts` and exports the compiled files from `.` and `./web`.

## GitHub tag and npm publishing

Web tags use `web-v<version>`, for example `web-v2.0.0`. The tag must match `package.json#version` exactly.

`.github/workflows/publish-web.yml` validates the package again, stages a fresh public artifact, and publishes it with npm. Configure npm Trusted Publishing for:

- organization/user: `TheTechclip`
- repository: `FunctionKit`
- workflow: `publish-web.yml`

The workflow uses GitHub OIDC (`id-token: write`); do not add a long-lived npm publish token unless trusted publishing is unavailable.

## Android and Apple

Android and Apple implementations, validation and release profiles are maintained on `dev/Native`. This branch exports Web source and tooling only.

## Public/private boundary

The npm artifact and any generated public repository must exclude `web/musecat/**` and tests or references that depend on it. Export lists are not a confidentiality boundary by themselves; always inspect the staged/public tree before pushing or publishing.
