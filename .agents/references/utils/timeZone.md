# timeZone

SSR-safe IANA time-zone display helpers. `formatTimeZoneCityName` derives a city from an IANA identifier and accepts an optional `TimeZoneCityNames` map for translated city labels. `formatTimeZoneDisplayName` and `formatTimeZoneDisplayLabel` prefer `Intl.DateTimeFormat` and fall back to that city name.
