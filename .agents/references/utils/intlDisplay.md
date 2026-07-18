# intlDisplay

SSR-safe display helpers for ISO 3166-1 alpha-2 region codes and ISO 4217 currency codes. `formatRegionDisplayName`, `formatRegionFlagEmoji`, `formatRegionDisplayLabel`, and `formatCurrencyDisplayName` return `null` for invalid input and use `Intl.DisplayNames` with a stable code fallback when unavailable.
