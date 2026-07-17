# Contributing to @musecat/functionkit

Thank you for your interest in contributing! We welcome bug reports, feature suggestions, and pull requests.

## Development Setup

```bash
git clone https://github.com/TheTechclip/FunctionKit.git
cd FunctionKit
npm install
```

## Available Scripts

| Command | Description |
|---|---|
| `npm test` | Run all tests with Vitest |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint all files with Biome |
| `npm run format` | Format all files with Prettier + Biome |

## Code Standards

- TypeScript strict mode is enabled — ensure your code compiles without errors.
- All new features must include corresponding tests.
- Hooks must start with `"use client"` directive. Pure utility functions must NOT.
- Always import from the barrel: `import { useDebounce } from "@musecap/functionkit"`. Subpath imports only when the export is not in the barrel.
- Follow the existing code style (tabs, double quotes, semicolons).

## Test Failure Resolution

When a test fails, reason about intent before patching:
1. Understand the component/hook's design contract — what it should do vs. what it actually does.
2. If the test correctly captures the intended behavior and the code violates it, fix the code.
3. If the code correctly implements the intended behavior and the test reflects outdated assumptions, fix the test.
4. If neither is clearly right, treat the source as the source of truth and align the test.

## Pull Request Process

1. Create a feature branch from `main`.
2. Write tests for your changes.
3. Ensure `npm run lint && npm test` passes.
4. Open a pull request describing the change and its motivation.

## Questions?

Feel free to open a discussion or issue for any questions.
