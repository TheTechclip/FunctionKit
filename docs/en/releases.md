# Release model

[English](./releases.md) | [한국어](../ko/releases.md)

This branch maintains FunctionKit Web releases; native development is maintained on `dev/Native`.

| Platform | Source | Current release status |
| --- | --- | --- |
| Web | `web/packages/**` | Published to npm as `@musecat/functionkit` |
| Musecat private Web | `web/musecat/**` | Never part of the public Web artifact |

## Web versioning

The npm lineage continues from `1.3.7`; the redesigned public surface starts at `2.0.0`.

Web releases use tags in the form:

```text
web-v2.0.0
web-v2.1.0
```

Platform-prefixed tags leave room for future Android and Apple release cadences without forcing every platform to share one version number.

## Web release pipeline

A Web release must pass:

1. lint and TypeScript checks;
2. 100% public Web coverage;
3. public API manifest/reference audit;
4. release graph validation, which rejects private Musecat source;
5. compilation to ESM + `.d.ts`;
6. a clean install/import smoke test against the packed tarball, including strict declaration checks with both Bundler and NodeNext resolution.

The existing root/Web barrel requires both React and ReactDOM peers. JavaScript and declaration relative imports use explicit `.js` specifiers so Node's ESM resolver and TypeScript NodeNext agree. The archive includes its license, changelog, contributor guidance and private security-reporting policy.

The publishing workflow is intended for GitHub-hosted Actions and npm Trusted Publishing. Configure `TheTechclip/FunctionKit` and the workflow filename in npm's Trusted Publisher settings before pushing the first release tag. npm's OIDC flow avoids storing a long-lived publish token and automatically attaches provenance for a public repository/package.

## Preparing locally

```bash
bun install --frozen-lockfile
bun run check:web
bun run pack:web
```

`pack:web` creates a fresh staged package before packing. The source workspace stays `private: true`, so `npm publish` from the repository root cannot accidentally publish private source.

## Native platforms

Android and Apple source, validation and release profiles are maintained on `dev/Native`. This branch and generated public repositories contain Web source and tooling only.
