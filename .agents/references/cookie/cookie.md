# Cookie API

## Purpose

`cookie.client.ts` owns client-side cookie read/write/delete utilities. `parseClientCookieNames.ts` is SSR-safe and remains separate so server code never imports a client module.

## Usage Logic

Each function wraps native `document.cookie` operations. `setClientCookie` writes an `expires` attribute when `days` is provided. `clearClientCookie` expires a host-only cookie by default, or a domain cookie when `hostname` is supplied. `clearAllClientCookies` tries host-only and parent-domain variants for the current path (and optionally `/`).

All mutation functions accept an optional `documentRef` to inject a mock document for testing. `clearAllClientCookies` accepts an optional `CookieStoreLike`; asynchronous deletion failures are ignored because this API returns the discovered names synchronously.

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
