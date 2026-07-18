# @musecat/functionkit

A React 19 + TypeScript UI F.E. utility library.

## Installation

```bash
npm install @musecat/functionkit
```

This package ships **raw TypeScript source** (no prebuilt bundle), so your app must transpile it.

### Next.js setup

Add the package to `transpilePackages` in `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@musecat/functionkit"],
};

export default nextConfig;
```

In App Router, import browser APIs and hooks from the barrel inside a Client Component. Pure utilities, date helpers, and types can be imported from the same barrel in Server Components.

```tsx
import { formatServerDate, useDebounce, ViewportPortal } from "@musecat/functionkit";
```

## Usage

```tsx
import { useDebounce, formatClientDateTime } from "@musecat/functionkit";

export default function Example() {
  const handleSearch = useDebounce((term: string) => fetchResults(term), 300);
  const now = formatClientDateTime(new Date(), {
    datePreset: "long",
    timePreset: "24h-minute",
  });

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      <span>{now}</span>
    </div>
  );
}
```

## References

This package includes `.agents/references/` directory with detailed documentation for every hook, component, and utility. Use it alongside TypeScript definitions as a guide when building with `@musecat/functionkit`.

## Acknowledgements

- [toss/react-simplikit](https://github.com/toss/react-simplikit/)

Published as raw TypeScript source and built with [TypeScript](https://www.typescriptlang.org/).

## License

[MIT License](./LICENSE) © Musecat Team.
