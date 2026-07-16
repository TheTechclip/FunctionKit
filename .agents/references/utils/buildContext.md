# buildContext

## Purpose

Eliminates `createContext` + `Provider` + `useContext` boilerplate. Creates a type-safe context pair in a single call: a typed accessor hook and a Provider component with automatic value memoization.

## Usage Logic

Creates a React context with the generic type `T`. Returns a tuple `[useCtx, Provider]`. The Provider wraps its `value` in `useMemo` to prevent unnecessary re-renders. If `displayName` is provided, it's assigned to the context for DevTools.

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
