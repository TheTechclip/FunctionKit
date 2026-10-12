# useLayerLuminance

> 상태: Reference
>
> Runtime: Client-only
>
> Public surface: `@musecat/functionkit/web` (root is the compatibility alias)

**Source:** [`useLayerLuminance.ts`](../../web/packages/hooks/useLayerLuminance.ts)
**Tests:** [`useLayerLuminance.test.ts`](../../tests/hooks/useLayerLuminance.test.ts), [`useLayerLuminance.lifecycle.test.ts`](../../tests/hooks/useLayerLuminance.lifecycle.test.ts)

[`useLayerLuminance.paint.test.ts`](../../tests/hooks/useLayerLuminance.paint.test.ts) checks unsupported colors and gradients, masked/control paint exclusion, cardinal directions, opacity, endpoint sampling, zero-area geometry, and opaque paint over an unknown backdrop.

## 목적과 소유권

렌더링된 surface/image의 밝기를 target 위치에서 샘플링해 정규화 luminance를 제공한다. dark/light 의미, threshold, theme 선택은 소비자가 소유한다.

## Public API

```ts
interface LuminanceThresholds {
  darkenAt: number;
  lightenAt: number;
}
function getColorLuminance(red: number, green: number, blue: number): number;
function resolveLuminanceThreshold(previousMatch: boolean, luminance: number | null, thresholds: LuminanceThresholds): boolean;
function useLayerLuminance(rootRef: React.RefObject<HTMLElement | null>, targetRefs: readonly React.RefObject<HTMLElement | null>[], options?: { includePaintLayers?: boolean }): (number | null)[];
```

## Runtime과 dependency

React client hook이며 DOM geometry, canvas, ResizeObserver, MutationObserver와 viewport resize subscription을 사용한다.

## 동작 계약

각 target 중심의 3×3 샘플 평균을 `0..1` luminance로 반환한다. image는 contain/cover geometry를 반영한다. 샘플할 수 없으면 `null`을 반환한다. `resolveLuminanceThreshold`는 선택적 hysteresis helper이며 실제 threshold 값은 소비자가 전달한다.

`includePaintLayers` defaults to false (original-image sampling). When true, elements marked
`data-layer-luminance-paint` contribute their computed, unmasked single linear-gradient paint
above the source image in DOM order. Supported gradients have degree/cardinal directions,
percentage stops and computed `rgb`/`rgba`/`color(srgb ...)` colors; unsupported or masked
paints are skipped. RGB/sRGB parsing uses the mandatory capture from the matched
color expression; there is no missing-channel fallback after a successful match.
Paint opacity and premultiplied alpha interpolation are included, so an
opaque overlay remains measurable even when the source image cannot be read. This is a bounded
paint model, not a general browser screenshot renderer: ancestor opacity, arbitrary stacking,
filters, masks and radial/conic gradients are not composed. Mark only overlays in their actual
paint order. Controls remain excluded. Style/class/color-mode mutations and settled scrolling
trigger resampling; gradients are parsed once per cycle, with no extra canvas reads.

## 접근성

DOM을 렌더링하지 않는다. 반환 luminance를 색상 선택에 쓸 경우 소비자는 충분한 contrast를 별도로 보장해야 한다.

## 오류와 cleanup

미준비/tainted image, canvas context 부재, 투명 surface는 안전하게 fallback하고 최종 샘플이 없으면 null이다. unmount에서 observer, event, timer, RAF를 모두 정리한다.

## 예제

```tsx
const [luminance] = useLayerLuminance(rootRef, [controlRef]);
const reversed = resolveLuminanceThreshold(false, luminance, {
  darkenAt: 0.35,
  lightenAt: 0.55,
});
```

## 금지 패턴

- hook 내부에 제품별 dark/light threshold를 고정하지 않는다.
- luminance를 접근성 contrast 보장으로 간주하지 않는다.

## 검증

위 tests가 sampling, image geometry, fallback, scheduling, cleanup 및 threshold helper를 검증한다.
