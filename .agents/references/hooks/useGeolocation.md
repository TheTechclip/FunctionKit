# useGeolocation

## Purpose

Wraps the Geolocation API (`navigator.geolocation`) for retrieving the user's current position or continuously watching position changes.

## Usage Logic

Supports two modes via the `action` option: `"GET"` calls `getCurrentPosition` once, `"WATCH"` uses `watchPosition` for continuous tracking. Provides imperative `startTracking` / `stopTracking` controls.

## Type Signature

```ts
interface UseGeolocationOptions {
  action?: "GET" | "WATCH";
}

function useGeolocation(options?: UseGeolocationOptions): {
  latitude: number | null;
  longitude: number | null;
  error: GeolocationPositionError | null;
  startTracking: () => void;
  stopTracking: () => void;
};
```

## Example Code

```tsx
import { useGeolocation } from "@musecat/functionkit";

function LocationDisplay() {
  const { latitude, longitude, error } = useGeolocation({ action: "GET" });
  if (error) return <div>Location unavailable</div>;
  return <div>{latitude}, {longitude}</div>;
}
```
