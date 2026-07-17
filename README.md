# @musecat/functionkit

A React 19 + TypeScript UI F.E. utility library.

## Installation

```bash
npm install @musecat/functionkit
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
    <View column gap={24}>
      <Input onChange={(e) => handleSearch(e.target.value)} />
      <Text type="Caption1">{now}</Text>
    </View>
  );
}
```

## References

This package includes `.agents/references/` directory with detailed documentation for every hook, component, and utility. Use it alongside TypeScript definitions as a guide when building with `@musecat/functionkit`.

## Acknowledgements

- [toss/react-simplikit](https://github.com/toss/react-simplikit/)

## License

[MIT License](./LICENSE) © Musecat Team.
