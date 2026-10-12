# objectUrl.client

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web`

**Source:** [implementation](../../../web/packages/utils/browser/objectUrl.client.ts)
**Tests:** [contract tests](../../../tests/utils/objectUrl.test.ts)

## 목적과 소유권

Release a preview URL after its caller no longer displays or uploads its Blob.
This helper does not allocate URLs or own image normalization.

## Public API

`revokeObjectUrl`. Source signatures define accepted arguments and return types.

## Runtime과 dependency

Client-only. No application imports; only standard JavaScript APIs.

## 동작 계약

Releases a caller-owned object URL. Empty input and unavailable URL.revokeObjectURL are safe no-ops. This helper owns no upload, image-normalization or product policy.

## 접근성

No interactive surface is rendered.

## 오류와 cleanup

The caller chooses the release point. Empty values and runtimes without
`URL.revokeObjectURL` do nothing. Errors from an available native revocation
method propagate; this helper does not revoke a URL while another owner uses it.

## 예제

```ts
import { revokeObjectUrl } from "@musecat/functionkit";

export function createPreview(file: Blob) {
  const url = URL.createObjectURL(file);
  return { url, dispose: () => revokeObjectUrl(url) };
}
// Dispose when the preview is removed, not immediately after assigning its src.
```

## 금지 패턴

Consumers must not deep-import implementation paths or move application policy into these helpers.

## 검증

The linked tests exercise input handling, calculations and cleanup according to the contracts above.
