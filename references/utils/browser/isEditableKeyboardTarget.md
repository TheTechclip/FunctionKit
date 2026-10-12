# isEditableKeyboardTarget

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`isEditableKeyboardTarget.ts`](../../../web/packages/utils/browser/isEditableKeyboardTarget.ts)
**Tests:** [`keyboardTarget.test.ts`](../../../tests/utils/keyboardTarget.test.ts)

## 목적과 소유권

Checks if a keyboard event target is an editable element (`input`, `textarea`, `select`, or `contentEditable`). Used to prevent keyboard navigation hooks from interfering with native input editing.

## 동작 계약

Examines the target element's tag name and `isContentEditable` property. Excludes buttons, checkboxes, and radio inputs from the editable set.

## Public API

```ts
function isEditableKeyboardTarget(target: EventTarget | null): boolean;
```

`HTMLElement`가 아니면 `false`다. `contentEditable`, `TEXTAREA`, `SELECT`, 그리고 `button`/`checkbox`/`radio`가 아닌 `INPUT`은 `true`로 분류한다. 일반 element와 세 가지 제외 input type은 `false`다.

## 예제

```tsx
import { isEditableKeyboardTarget, useKeyboardListNavigation } from "@musecat/functionkit/web";

function SearchableList({ items }: { items: string[] }) {
  const { handleListKeyDown } = useKeyboardListNavigation({
    itemCount: items.length,
    onSelect: (i) => console.log(items[i]),
  });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (isEditableKeyboardTarget(e.target)) return; // Don't steal from inputs
    handleListKeyDown(e);
  };

  return <ul onKeyDown={onKeyDown}>...</ul>;
}
```

## Runtime과 dependency

Client-only API다. browser capability 또는 React client lifecycle/effect에 의존하므로 Server Component에서 직접 실행하지 않는다.

## 접근성

해당 없음 — 이 reference의 API는 독립적인 interactive semantic surface를 직접 렌더링하지 않는다.

## 오류와 cleanup

resource를 만들지 않아 cleanup이 없다. `target instanceof HTMLElement`를 사용하므로 DOM runtime이 없는 곳에서 호출하는 API가 아니며, 지원되지 않는 target은 `false`로 fallback하는 대신 non-element에 대해서만 명시적으로 `false`를 반환한다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`keyboardTarget.test.ts`](../../../tests/utils/keyboardTarget.test.ts)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
