# buildContext

## Purpose

Eliminates `createContext` + `Provider` + `useContext` boilerplate. Creates a type-safe accessor hook and Provider component in one call.

## Usage Logic

Creates a React context with the generic type `T`. Returns `[useCtx, Provider]`. If `displayName` is provided, it is assigned for DevTools and included in the error thrown when the hook is called outside its Provider. The Provider intentionally passes `value` through unchanged, so callers control memoization semantics.

## Type Signature

```ts
function buildContext<T>(
  displayName?: string
): [
  useCtx: () => T,
  Provider: React.FC<{ value: T; children: ReactNode }>
];
```

## Example Code

```tsx
import { buildContext } from "@musecat/functionkit";

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
