# Changelog

All notable public changes to FunctionKit are recorded here.

## 2.0.0

### Added

- Compiled ESM and TypeScript declaration output for the npm Web package.
- Explicit runtime metadata for public symbols.
- Persistence-neutral read-state core with cookie and Storage adapters.
- `ScrollTo` with explicit window/element destinations.
- `useLayerLuminance` and consumer-owned luminance threshold resolution.
- Bilingual Korean/English documentation and release guidance.

### Changed

- The public npm release is built only from `web/packages/**`.
- Repository metadata now points at `TheTechclip/FunctionKit`.
- Web, Android, and Apple share one repository while keeping separate release boundaries.

### Removed

- Musecat-specific locale, date/time, currency/provider, media, and business policy from the public Web artifact.
- `ScrolltoTop`, `useLayerBrightness`, and fixed-key read/seen APIs from the public surface.

## 1.3.7

Last historical npm release before the 2.0 public-boundary redesign.
