# 실전 조합 예제

[한국어](./recipes.md) | [English](../en/recipes.md)

## controlled와 uncontrolled를 함께 지원하기

```tsx check
"use client";

import { useControllableState } from "@musecat/functionkit";

type DisclosureProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Disclosure({ open, defaultOpen = false, onOpenChange }: DisclosureProps) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
  });

  function toggle() {
    const next = !isOpen;
    setOpen(next);
    onOpenChange?.(next);
  }

  return <button type="button" aria-expanded={isOpen} onClick={toggle}>{isOpen ? "닫기" : "열기"}</button>;
}
```

hook 옵션은 `value`, `defaultValue`뿐입니다. setter는 uncontrolled mode의 내부 상태만 바꾸며 controlled mode에서는 부모가 `onOpenChange`를 통해 `open`을 갱신해야 합니다. callback은 hook이 아니라 컴포넌트가 호출합니다. 자세한 계약은 [reference](../../references/hooks/useControllableState.md)를 확인하세요.

## 읽음 상태와 저장 방식을 분리하기

이 코드는 브라우저 event나 effect에서 실행합니다. 서버 렌더링 중에는 실행하지 않습니다.

```ts check
import {
  hasReadState,
  markStorageReadState,
} from "@musecat/functionkit";

const key = "product-tour-read";
const item = "search-v2";

const current = localStorage.getItem(key);
if (!hasReadState(current, item)) {
  markStorageReadState(localStorage, key, [item]);
}
```

서버에서도 같은 값을 읽어야 한다면 cookie adapter로 바꿀 수 있습니다. 저장 위치가 달라져도 직렬화 형식은 같습니다.

## 밝기 측정값으로 앱의 색상 정책 만들기

```tsx check
"use client";

import {
  resolveLuminanceThreshold,
  useLayerLuminance,
} from "@musecat/functionkit";
import { useMemo, useRef } from "react";

export function FloatingControl() {
  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const targets = useMemo(() => [controlRef], []);
  const [luminance] = useLayerLuminance(rootRef, targets);

  const reversed = resolveLuminanceThreshold(false, luminance, {
    darkenAt: 0.35,
    lightenAt: 0.55,
  });

  return (
    <div ref={rootRef}>
      <button ref={controlRef} data-reversed={reversed || undefined}>
        다음
      </button>
    </div>
  );
}
```

`0.35`, `0.55`는 앱이 선택한 값입니다. FunctionKit은 dark/light 기준을 고정하지 않습니다.

## 리스트형 UI에 키보드 이동 붙이기

`useKeyboardListNavigation`은 menu나 select 자체가 아니라 그보다 아래 단계의 도구입니다. 아이템의 의미와 ARIA는 컴포넌트가 직접 소유하고, 방향키·Home/End·typeahead 동작만 공통화하고 싶을 때 적합합니다. 키보드 이동만 붙였다고 접근성이 완성되는 것은 아니므로 [전체 계약](../../references/hooks/useKeyboardListNavigation.md)을 함께 확인하세요.

## 원하는 위치로 스크롤하기

```tsx check
"use client";

import { ScrollTo } from "@musecat/functionkit";

export function RouteReset() {
  return <ScrollTo top={0} left={0} />;
}
```

특정 element를 움직일 수도 있습니다.

```tsx check
"use client";

import { ScrollTo } from "@musecat/functionkit";
import { useRef } from "react";

export function PanelReset() {
  const panelRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={panelRef} style={{ height: 200, overflow: "auto" }}>
      <ScrollTo target={panelRef} top={320} behavior="smooth" />
      <div style={{ height: 1000 }}>스크롤할 내용</div>
    </div>
  );
}
```

`ScrollTo`는 focus를 건드리지 않습니다. 페이지 이동 뒤 focus를 어디에 둘지는 앱에서 따로 처리해야 합니다.

## 예제 검사

`ts check`, `tsx check` fence는 각각 독립된 완전한 모듈입니다. FunctionKit 디렉터리에서 `bun scripts/checkDocumentationSnippets.mjs`를 실행하면 실제 public Web export에 대해 strict TypeScript 검사를 수행합니다. API 선언 block은 실행 예제가 아니라 시그니처 설명입니다.
