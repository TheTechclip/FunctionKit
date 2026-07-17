# floatingMotion

## Purpose

Provides animation presets and transform utilities for floating UI elements: tooltips, popovers, modals, and mobile sheets. Calculates `initial`, `animate`, and `exit` states for Framer Motion.

## Usage Logic

**`getFloatingMotionPreset(mode, placement?)`**: Returns a complete Framer Motion preset object based on the mode and optional placement.

**`getFloatingTransformOrigin(placement)`**: Returns the correct `transformOrigin` string for a given placement.
**`getFloatingHiddenTransform(placement)`**: Returns the hidden-state transform offset for a given placement.

### Modes
| Mode | Description | Animation |
|------|-------------|-----------|
| `anchored` | Tooltips, popovers | Scale + fade from placement origin |
| `center-selected` | Center-positioned selection | Scale in place |
| `modal-center` | Modal windows | Scale + fade in center |
| `mobile-sheet` | Bottom sheets | Slide up from bottom |

## Type Signatures

```ts
type FloatingMotionMode = "anchored" | "center-selected" | "modal-center" | "mobile-sheet";
type FloatingPlacement = "top" | "bottom" | "left" | "right" | "top-start" | "top-end" | ...;
type FloatingMotionPreset = {
  initial: Variants;
  animate: Variants;
  exit: Variants;
  transition: Transition;
};

function getFloatingMotionPreset(
  mode: FloatingMotionMode,
  placement?: FloatingPlacement
): FloatingMotionPreset;

function getFloatingTransformOrigin(placement: FloatingPlacement): string;
function getFloatingHiddenTransform(placement: FloatingPlacement): { x?: number; y?: number };
```

## Example Code

```tsx
import { getFloatingMotionPreset } from "@musecat/functionkit";
import { motion, AnimatePresence } from "framer-motion";

function Tooltip({ open, children }: { open: boolean; children: ReactNode }) {
  const preset = getFloatingMotionPreset("anchored", "top");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={preset}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```
