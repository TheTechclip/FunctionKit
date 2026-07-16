export const SEEN_STORAGE_KEY = "seen";

type SeenMap = Partial<Record<string, boolean>>;

export function parseSeen(raw: string | null): SeenMap {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as SeenMap;
  } catch {
    return {};
  }
}

export function hasSeenKey(raw: string | null, key: string) {
  const map = parseSeen(raw);
  return map[key] === true;
}

export function buildSeenValue(raw: string | null, key: string): string {
  const map = parseSeen(raw);
  map[key] = true;
  return JSON.stringify(map);
}
