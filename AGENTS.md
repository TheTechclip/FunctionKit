# FunctionKit (@musecat/functionkit)

React 19 frontend utility library. Single package, ESM.

## Import Convention Enforcement (Mandatory)

- **Barrel imports are the rule:** `import { useDebounce } from "@musecat/functionkit"`.
- **Subpath imports are only allowed when:** the export is not in the barrel (`useCheckInvisible`, `SwitchCase`, `ScrolltoTop`) or tree-shaking is absolutely required.
- **Type imports also go through the barrel:** `import type { AppLocale, DateInput } from "@musecat/functionkit"`.
- **No reimplementation:** If FunctionKit already provides a feature, reuse it. Never write a duplicate.

## SSR Safety Classification

| Category | Condition | Examples |
|---|---|---|
| **SSR-safe** | No `"use client"`, pure function | `formatLongDate`, `mergeRefs`, `SwitchCase`, `getDeviceInfo`, `floatingMotion`, `seen`, `parseClientCookieNames`, `debounce` |
| **Client-only** | `"use client"` or `window` access | All hooks, `ViewportPortal`, `ScrolltoTop`, `browserStorage`, `cookie` (except `parseClientCookieNames`), `clipboardShare`, `isEditableKeyboardTarget` |

SSR-safe functions can be used freely in Server Components, RSC, and Client Components. Client-only items must only be used in `"use client"` components.

## Barrel Export Mapping

The barrel (`index.ts`) exports 63 named exports. **Items NOT in the barrel (require subpath imports):**
- `SwitchCase` — component subpath
- `ScrolltoTop` — component subpath
- `useCheckInvisible` — `@musecat/functionkit/hooks/useCheckInvisible`
- `useCheckScroll` — `@musecat/functionkit/hooks/useCheckScroll`

When adding new features, register them in the barrel.

## Hook Selection Guidelines

| Scenario | Hook to Use |
|---|---|
| Debounce rapid state changes | `useDebounce` or `useDebouncedCallback` |
| Polling / repeated execution | `useInterval` |
| Delayed single execution | `useTimeout` |
| Keyboard list navigation | `useKeyboardListNavigation` |
| Long press gesture | `useLongPress` |
| Single/double click distinction | `useDoubleClick` |
| Geolocation tracking | `useGeolocation` |
| Client date formatting | `useClientDateTime` |
| Relative time ("3 minutes ago") | `useRelativeDateTime` |
| IntersectionObserver | `useIntersectionObserver` |
| Keyboard avoidance (mobile) | `useAvoidKeyboard` |
| Viewport height | `useViewportHeight` |
| Media query matching | `useViewportMatch` |
| Scroll position detection | `useCheckScroll` (subpath) |
| Element visibility detection | `useCheckInvisible` (subpath) |
| Toggle state | `useToggleState` |
| Hydration guard | `useHasMounted` |
| Stable callback reference | `usePreservedCallback` |
| Deep equality reference | `usePreservedReference` |
| Ref lifecycle | `useRefEffect` |

## Component Selection Guidelines

- **SwitchCase** — Prefer over inline &&/ternary for multi-branch rendering. SSR-safe.
- **ViewportPortal** — Fixed-position overlays, modals, toasts. Client-only.
- **ScrolltoTop** — Scroll reset on page navigation. Client-only.

Never write raw `createContext` + `Provider` + `useContext` boilerplate. Use `buildContext` instead.

## DateTime Formatting Guidelines

| Context | Use | SSR-safe |
|---|---|---|
| Server static date | `formatServerDate` / `formatServerDateTime` | Yes |
| Client date | `formatClientDate` / `formatClientDateTime` | No |
| Relative time ("3분 전") | `formatServerRelative` (server) / `formatClientRelative` (client) | Mixed |
| Remaining time ("2일 3시간 남음") | `formatRemainingText` | Yes |
| UTC key ("YYYY-MM-DD") | `formatUtcDateKey` / `parseUtcDateInput` | Yes |
| Raw formatters | `formatLongDate`, `formatDotDate`, `formatKoreanTime` etc. | Yes |

**Locale handling:** `DateInput` accepts `string | number | Date`. Use `normalizeAppLocale("ko")` → `"kr"`, `toIntlLocale("kr")` → `"ko-KR"`.

## Cookie & Storage API Guidelines

| Operation | API | SSR-safe |
|---|---|---|
| Read cookie | `getClientCookie(name)` | No |
| Write cookie | `setClientCookie(name, value, days?)` | No |
| Delete cookie | `clearClientCookie(name)` / `clearAllClientCookies()` | No |
| Parse cookie names | `parseClientCookieNames(cookieString)` | **Yes** |
| localStorage | `getLocalStorage` / `updateLocalStorage` / `removeLocalStorage` | No |
| sessionStorage | `getSessionStorage` / `updateSessionStorage` / `removeSessionStorage` | No |

`clearAllClientCookies` tries all domain/path combinations — use with caution.

## Context & Utility Patterns

- **`buildContext`:** Creates `createContext` + Provider + `useContext` in one call. `const [useMyCtx, MyProvider] = buildContext<MyType>()`.
- **`mergeRefs`:** Merges multiple refs into a single callback ref. Use when forwarding refs.
- **`getDeviceInfo`:** UA-based device detection. Callable at module scope. Returns `isMobile`, `isIOS`, `isAndroid`, etc.
- **`isEditableKeyboardTarget`:** Checks if a key event target is an editable element. Use before keyboard navigation.
- **`NavigatorClipboard` / `NavigatorShare`:** Clipboard copy/share with automatic fallback on failure.
- **`floatingMotion`:** `getFloatingMotionPreset` for tooltip/popover/modal animation configs. 4 modes (anchored, center-selected, modal-center, mobile-sheet).
- **`seen`:** `hasSeenKey` / `buildSeenValue` for "user has already seen" state management. SSR-safe.
- **`subscribeKeyboardHeight`:** Low-level keyboard height change detection. Used internally by `useKeyboardHeight`.

## Documentation Maintenance

- When hooks, components, or utils are added, modified, or removed, update the corresponding `.agents/references/` documentation.
- When the barrel (`index.ts`) export list changes, update the Barrel Export Mapping section above.
- Before using any feature, read the corresponding `.agents/references/` doc first.

### Reference File Mapping

| Category | File(s) |
|---|---|
| Components | `.agents/references/components/SwitchCase.md`, `ScrolltoTop.md`, `ViewportPortal.md` |
| Hooks | `.agents/references/hooks/usePreservedCallback.md`, `usePreservedReference.md`, `useRefEffect.md`, `useDebounce.md`, `useDebouncedCallback.md`, `useInterval.md`, `useTimeout.md`, `useKeyboardListNavigation.md`, `useLongPress.md`, `useDoubleClick.md`, `useIntersectionObserver.md`, `useCheckInvisible.md`, `useCheckScroll.md`, `useViewportHeight.md`, `useViewportMatch.md`, `useAvoidKeyboard.md`, `useToggleState.md`, `useHasMounted.md`, `useGeolocation.md`, `useKeyboardHeight.md`, `useClientDateTime.md`, `useRelativeDateTime.md` |
| Cookie | `.agents/references/cookie/cookie.md` |
| DateTime | `.agents/references/datetime/dateTime.shared.md`, `dateTime.client.md`, `dateTime.server.md` |
| Utils | `.agents/references/utils/buildContext.md`, `mergeRefs.md`, `floatingMotion.md`, `browserStorage.md`, `getDeviceInfo.md`, `clipboardShare.md`, `isEditableKeyboardTarget.md`, `seen.md`, `subscribeKeyboardHeight.md` |

### usePreservedCallback Trade-off

`usePreservedCallback` uses `useRef` + `useEffect` to keep a stable callback reference that always calls the latest version. Because the ref is synced via `useEffect` (after paint), the returned callback may hold a **stale value** during the first render or in the gap between a re-render and the effect flush. In practice this is never an issue — the callback is only invoked in event handlers that fire post-paint. This is the same pattern used by react-hook-form, Radix UI, and others. If synchronous invocation during render is required, use a regular `useCallback` with inline deps instead.
