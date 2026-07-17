# Cookie API

## Purpose

Client-side cookie read/write/delete utilities. All functions except `parseClientCookieNames` access `document.cookie` and are client-only.

## Usage Logic

Each function wraps native `document.cookie` operations. `setClientCookie` handles expiry via `Max-Age`. `clearClientCookie` and `clearAllClientCookies` set `Max-Age=0` to delete. `clearAllClientCookies` iterates over all domain/path combinations to ensure thorough cleanup.

All mutation functions accept an optional `documentRef` to inject a mock document for testing. `setClientCookie` also accepts an optional `CookieStoreLike` via options.

## Type Signatures

```ts
function getClientCookie(name: string): string | undefined;
function setClientCookie(name: string, value: string, days?: number, documentRef?: DocumentCookieRef): void;
function clearClientCookie(name: string, options?: ClearClientCookieOptions): void;
function clearAllClientCookies(options?: ClearAllClientCookiesOptions): string[];
function parseClientCookieNames(cookieString: string): string[]; // SSR-safe
```

- `DocumentCookieRef` = `{ cookie: string }`
- `ClearClientCookieOptions` = `{ hostname?: string; path?: string; documentRef?: DocumentCookieRef; cookieStore?: CookieStoreLike }`
- `ClearAllClientCookiesOptions` extends `ClearClientCookieOptions` with `{ includeRoot?: boolean; cookieString?: string }`

## Example Code

```tsx
import {
  getClientCookie,
  setClientCookie,
  clearClientCookie,
  clearAllClientCookies,
  parseClientCookieNames,
} from "@musecat/functionkit";

function useSession() {
  const token = getClientCookie("session_token");

  const login = (token: string) => setClientCookie("session_token", token, 7);

  const logout = () => clearClientCookie("session_token");

  return { token, login, logout };
}

// SSR-safe usage (Server Component)
function CookieNames({ cookieString }: { cookieString: string }) {
  const names = parseClientCookieNames(cookieString);
  return <div>Cookies: {names.join(", ")}</div>;
}
```
