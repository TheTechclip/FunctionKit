# ViewportPortal

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`ViewportPortal.tsx`](../../web/packages/components/ViewportPortal.tsx)
**Tests:** [`ViewportPortal.test.tsx`](../../tests/components/ViewportPortal.test.tsx)

## 목적과 소유권

Renders children into a fixed-position portal root (`#viewport-portal-root`) using `createPortal`. Designed for overlays, modals, toasts, and tooltips that need to escape parent overflow/stacking contexts.

## 동작 계약

On first render, ensures the portal root `<div>` exists in `document.body`. Then portals children into it. The portal root has `position: fixed`, `inset: 0`, `z-index: 9999`, and `pointer-events: none`. Children must set `pointer-events: auto` to be interactive.

## Public API

```ts
function ViewportPortal({ children }: { children: ReactNode }): ReactPortal;

// Utility to get the portal root element
function getViewportPortalRoot(): HTMLDivElement;
```

## 예제

```tsx
import { ViewportPortal } from "@musecat/functionkit/web";

function ToastContainer() {
  return (
    <ViewportPortal>
      <div style={{ pointerEvents: "auto" }}>
        <Toast message="Saved!" />
      </div>
    </ViewportPortal>
  );
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성


Mapped component는 composed host semantics를 사용한다. 접근성 behavior 변경은 source와 component contract test를 함께 갱신한다.

## 오류와 cleanup

장기 유지되는 browser resource를 직접 소유하지 않는다. throw/null/fallback semantics가 있는 경우 위 동작 계약과 source signature를 따른다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`ViewportPortal.test.tsx`](../../tests/components/ViewportPortal.test.tsx)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
