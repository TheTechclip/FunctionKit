# API map

[English](./api.md) | [한국어](../ko/api.md)

This page is for discovery. It groups APIs by what they help you do; exact signatures and edge cases live in the linked references.

## State and interaction

| API | Use it for |
| --- | --- |
| `useControllableState` | One component API that supports both controlled and uncontrolled state. |
| `useToggleState` | Small boolean state with toggle/set helpers. |
| `useCollectionSelection` | Single/multiple selection, range selection, select-all, and selection intent. |
| `useLongPress` | Pointer/touch long-press behavior with cleanup. |
| `useDoubleClick` | Distinguish single and double activation timing. |

References: [controllable state](../../references/hooks/useControllableState.md), [collection selection](../../references/hooks/useCollectionSelection.md), [long press](../../references/hooks/useLongPress.md).

## Timing and stable callbacks

| API | Use it for |
| --- | --- |
| `debounce` | Framework-independent debouncing. |
| `useDebounce` | Debounce callback invocations with typed arguments and cancellation. |
| `useDebouncedCallback` | Debounce boolean changes, cancelling a pending change when it returns to the last committed value. |
| `useInterval` | Interval lifecycle in React. |
| `useTimeout` | Timeout lifecycle in React. |
| `usePreservedCallback` | Stable function identity; the implementation updates after the React effect runs. |
| `usePreservedReference` | Return the previous value itself while the comparator considers it equal; not a ref object. |
| `useRefEffect` | Attach and clean up behavior when a ref target changes. |

## Keyboard, viewport, and visibility

| API | Use it for |
| --- | --- |
| `useKeyboardListNavigation` | Arrow/Home/End/typeahead navigation for list-like widgets. |
| `useKeyboardHeight` / `subscribeKeyboardHeight` | Track virtual keyboard geometry. |
| `useAvoidKeyboard` | Adjust client UI around the virtual keyboard. |
| `useViewportMatch` | Subscribe to a media query. |
| `useViewportHeight` | Track usable viewport height. |
| `useIntersectionObserver` | Observe intersection lifecycle. |
| `useCheckInvisible` | Detect whether a target is visually outside the relevant viewport. |
| `useCheckScroll` | Track scroll availability/state. |
| `useScrollLock` | Own and release a document scroll lock. |

Low-level subscriptions are also public: `subscribeWindowResize`, `subscribeWindowScroll`, `subscribeViewportResize`, `subscribeViewportScroll`, `subscribeVisualViewportResize`, `subscribeVisualViewportScroll`, and `subscribeViewportGeometry`.

## Browser persistence and capabilities

### Storage

`getLocalStorage`, `updateLocalStorage`, `removeLocalStorage`, `getSessionStorage`, `updateSessionStorage`, `removeSessionStorage`.

### Cookies

`getClientCookie`, `setClientCookie`, `clearClientCookie`, `clearAllClientCookies`, and the Universal `parseClientCookieNames`.

### Read state

The serialization core is persistence-agnostic:

- `parseReadState`
- `hasReadState`
- `markReadState`

Cookie and Storage adapters are separate:

- `getCookieReadState`, `hasCookieReadState`, `markCookieReadState`
- `getStorageReadState`, `hasStorageReadState`, `markStorageReadState`

The caller owns the persistence key.

### Clipboard and Share

`NavigatorClipboard` and `NavigatorShare` wrap browser capability checks and return typed results rather than forcing application code to repeat the same branching.

### Device and editable targets

`getDeviceInfo` provides a guarded browser fallback. `isEditableKeyboardTarget` helps keyboard handlers avoid intercepting editable elements.

## Rendering helpers

| API | Use it for |
| --- | --- |
| `SwitchCase` | Declarative conditional rendering without product policy. |
| `ViewportPortal` / `getViewportPortalRoot` | Render into a viewport-level portal root. |
| `ScrollTo` | Imperatively scroll the window or a supplied element to an explicit destination. |

## Utility primitives

- URL/string: `toURL`, `isHttpUrl`, `isEmailAddress`, `normalizeHostname`, `hostMatchesAny`, `toTrimmedString`
- refs/context: `mergeRefs`, `buildContext`
- in-memory navigation: `createMemoryHistory`
- Escape coordination: `acquireEscapeDismissalBlock`, `isEscapeDismissalBlocked`

## Layer luminance

`useLayerLuminance` samples the rendered layer behind target elements and returns normalized luminance values. `resolveLuminanceThreshold` is an optional hysteresis helper; threshold values remain application policy.

See [the reference](../../references/hooks/useLayerLuminance.md) before using image-backed surfaces because canvas security and sampling fallbacks are part of the contract.

## Complete inventory

This page intentionally does not duplicate every exported type. The generated [`publicApi.manifest.json`](../../publicApi.manifest.json) is the complete source of truth for all 94 public exports, runtime labels, source owners, and reference mappings.
