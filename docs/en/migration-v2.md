# Migrating from 1.x to 2.0

[English](./migration-v2.md) | [한국어](../ko/migration-v2.md)

The historical npm line ended at `@musecat/functionkit@1.3.7`. Version 2 keeps the same package name but deliberately resets the public boundary.

## Why 2.0 is a major release

1.x mixed product-specific formatting and policy with general-purpose utilities and shipped raw TypeScript source as the package entry. Version 2 removes that product policy from the public Web artifact and publishes compiled ESM with `.d.ts` files instead.

Consumers should review imports rather than treating this as a drop-in patch.

## Package consumption

### 1.x

```ts
import { useDebounce } from "@musecat/functionkit";
```

The import syntax was already simple, but the package entry pointed at TypeScript source.

### 2.0

```ts
import { useDebounce } from "@musecat/functionkit";
```

The import stays the same. The installed package now resolves to compiled ESM and declarations, so package-specific transpilation is no longer required.

## Renamed/generalized APIs

| 1.x / earlier internal API | 2.0 | Reason |
| --- | --- | --- |
| `ScrolltoTop` | `ScrollTo` | Destination is explicit; top is only the default. |
| `useLayerBrightness` | `useLayerLuminance` | Return the measurement rather than a dark/light policy decision. |
| `resolveLayerDarkness` | `resolveLuminanceThreshold` | Thresholds are supplied by the consumer. |
| read/seen helpers with a fixed persistence key | `readState` core + cookie/storage adapters | Serialization and persistence are separate; keys belong to the app. |

## Removed from the public Web package

Application-specific date/time, locale mapping, currency/provider logic, geography/media policy, and Musecat-only hooks are not part of the 2.0 npm artifact. If your 1.x consumer used those APIs, move the policy into your application or replace it with a dedicated package before upgrading.

The public release graph is limited to `web/packages/**`. `web/musecat/**` exists only for the private monorepo and is rejected from the public Web release.

## Runtime metadata is now explicit

Every symbol has a runtime classification in [`publicApi.manifest.json`](../../publicApi.manifest.json). Review Client-only hooks before moving code into React Server Components.

## Recommended upgrade process

1. Upgrade in a branch and let TypeScript report removed exports.
2. Replace renamed APIs using the table above.
3. Move product policy that used to come from 1.x into application-owned code.
4. Remove `transpilePackages` entries that existed only for FunctionKit.
5. Run your SSR/Server Component tests as well as client tests.
6. Check the linked reference for any browser API you depend on.
