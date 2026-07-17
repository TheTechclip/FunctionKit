# NavigatorClipboard / NavigatorShare (clipboardShare)

## Purpose

Provides easy-to-use React components for clipboard copy and native share. Handles error cases with automatic fallback (e.g., if `navigator.share` fails, falls back to clipboard).

## Usage Logic

**NavigatorClipboard**: On click, calls `navigator.clipboard.writeText(text)`. Calls `onComplete` with the result.

**NavigatorShare**: On click, calls `navigator.share({ title, text, url })`. If share fails (or is unavailable), falls back to clipboard copy and calls `onComplete` with fallback info.

## Type Signatures

```ts
interface NavigatorClipboardProps {
  text: string;
  onComplete?: (result: NavigatorClipboardResult) => void;
  children?: ReactNode;
}

interface NavigatorShareProps {
  title?: string;
  text?: string;
  url?: string;
  onComplete?: (result: NavigatorShareResult) => void;
  children?: ReactNode;
}

interface NavigatorClipboardResult {
  copied: boolean;
  error?: Error;
}

interface NavigatorShareResult {
  shared: boolean;
  copied: boolean;
  error?: Error;
}
```

## Example Code

```tsx
import { NavigatorClipboard, NavigatorShare } from "@musecat/functionkit";

function ShareButton({ url }: { url: string }) {
  return (
    <div>
      <NavigatorClipboard text={url}>
        <button>Copy Link</button>
      </NavigatorClipboard>
      <NavigatorShare title="Check this out" url={url}>
        <button>Share</button>
      </NavigatorShare>
    </div>
  );
}
```
