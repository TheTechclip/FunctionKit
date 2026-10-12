# NavigatorClipboard / NavigatorShare (clipboardShare)

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`clipboardShare.tsx`](../../../web/packages/utils/browser/clipboardShare.tsx), [`clipboardShare.types.ts`](../../../web/packages/utils/browser/clipboardShare.types.ts)
**Tests:** [`clipboardShare.test.ts`](../../../tests/utils/clipboardShare.test.ts)

## 목적과 소유권

Promise-returning browser adapter functions, not React components. The caller owns the user-gesture event handler and any result feedback; these functions do not render buttons or accept children/onComplete.

## 동작 계약

- `NavigatorClipboard({ text })` copies text and resolves `{ success: true }`. Missing navigator/clipboard, synchronous browser exceptions, and rejected writes resolve `{ success: false }`.
- `NavigatorShare({ title, text, link })` passes `{ title, text, url: link }` to Web Share and resolves `{ success: true, method: "share" }` on success.
- An `AbortError` (including synchronous cancellation) resolves `{ success: false, method: "share" }` without copying. Other share failures or absent Web Share fall back to copying **link**, not text.
- Successful fallback resolves `{ success: true, method: "clipboard" }`; failed/unavailable fallback resolves `{ success: false, method: "unsupported" }`. This existing status also represents denied clipboard permission, not only absent APIs.

## Public API

```ts
type NavigatorClipboardProps = { text: string };
type NavigatorClipboardResult = { success: boolean };
type NavigatorShareProps = { title: string; text: string; link: string };
type NavigatorShareResult = {
  success: boolean;
  method: "share" | "clipboard" | "unsupported";
};

function NavigatorClipboard(props: NavigatorClipboardProps): Promise<NavigatorClipboardResult>;
function NavigatorShare(props: NavigatorShareProps): Promise<NavigatorShareResult>;
```

## 예제

```ts
import { NavigatorClipboard, NavigatorShare } from "@musecat/functionkit/web";

// Invoke from client button event handlers to retain browser user activation.
async function copyLink(link: string) {
  const { success } = await NavigatorClipboard({ text: link });
  return success ? "Link copied" : "Could not copy link";
}

async function shareLink(link: string) {
  const result = await NavigatorShare({ title: "Article", text: "Read this article", link });
  if (result.success) return result.method === "share" ? "Shared" : "Link copied";
  return result.method === "share" ? "Share canceled" : "Could not share or copy link";
}
```

## Runtime과 dependency

Client-only browser utilities. The missing-navigator fallback prevents capability errors but does not make server execution a meaningful clipboard/share action. No React dependency is required by these functions.

## 접근성

The caller supplies a semantic button and accessible result feedback; no interactive surface is rendered here.

## 오류와 cleanup

Browser capability errors are converted to the documented result, not thrown synchronously. No listeners/timers are retained, and there is no unsubscribe/cancellation handle. Callers own their UI lifecycle while awaiting results.

## 금지 패턴

- Do not use `<NavigatorShare>` or `<NavigatorClipboard>` JSX or invent `url`, `children`, `onComplete`, `copied`, or `shared` props/results.
- Do not deep import `@musecat/functionkit/packages/...`.

## 검증

[`clipboardShare.test.ts`](../../../tests/utils/clipboardShare.test.ts) fixes the capability, success, permission failure, cancellation, and fallback contracts. Changes require FunctionKit typecheck/lint/reference checks.
