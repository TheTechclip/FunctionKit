# buildContext

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web (root is the compatibility alias)`

**Source:** [`buildContext.tsx`](../../web/packages/utils/buildContext.tsx)
**Tests:** [`buildContext.test.tsx`](../../tests/utils/buildContext.test.tsx)

## 목적과 소유권

Eliminates `createContext` + `Provider` + `useContext` boilerplate. Creates a type-safe accessor hook and Provider component in one call.

## 동작 계약

Creates a React context with the generic type `T`. Returns `[useCtx, Provider]`. If `displayName` is provided, it is assigned for DevTools and included in the error thrown when the hook is called outside its Provider. The Provider intentionally passes `value` through unchanged, so callers control memoization semantics.

## Public API

```ts
function buildContext<T>(
	displayName?: string,
): [useCtx: () => T, Provider: React.FC<{ value: T; children: ReactNode }>];
```

## 예제

```tsx
import { buildContext } from "@musecat/functionkit/web";

interface Theme {
	color: string;
	bg: string;
}

const [useTheme, ThemeProvider] = buildContext<Theme>("ThemeContext");

// Usage
function App() {
	return (
		<ThemeProvider value={{ color: "#000", bg: "#fff" }}>
			<ThemedButton />
		</ThemeProvider>
	);
}

function ThemedButton() {
	const theme = useTheme();
	return <button style={{ color: theme.color, background: theme.bg }}>Click</button>;
}
```

## Runtime과 dependency

`"use client"` 모듈이며 React `createContext`/`useContext`로 accessor hook과 Provider를 만든다. browser API는 직접 쓰지 않지만 React client context lifecycle에 속하므로 Server Component에서 직접 호출하지 않고 `@musecat/functionkit/web`을 사용한다.

## 접근성

해당 없음 — 이 reference의 API는 독립적인 interactive semantic surface를 직접 렌더링하지 않는다.

## 오류와 cleanup

global listener, timer, subscription을 만들지 않는다. 생성된 accessor hook은 matching Provider 밖에서 호출하면 display name을 포함한 명시적 Error를 던진다; Provider는 consumer value를 그대로 전달하므로 memoization도 consumer 책임이다.

## 금지 패턴

- `@musecat/functionkit/packages/...` 같은 내부 source deep import를 consumer에서 사용하지 않는다.
- source/type에 없는 compatibility API를 문서만 보고 추정해 추가하지 않는다.

## 검증

[`buildContext.test.tsx`](../../tests/utils/buildContext.test.tsx)가 이 API의 현재 contract 근거다. 변경 시 해당 test와 FunctionKit typecheck/lint/public manifest 검증을 함께 실행한다.
