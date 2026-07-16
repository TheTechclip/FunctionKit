"use client";

type StorageKind = "localStorage" | "sessionStorage";

function getStorage(kind: StorageKind): Storage | null {
  if (typeof window === "undefined") return null;
  return window[kind];
}

function saveStorage(kind: StorageKind, key: string, value: unknown) {
  const storage = getStorage(kind);
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {}
}

function loadStorage(kind: StorageKind, key: string): unknown {
  const storage = getStorage(kind);
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function removeStorage(kind: StorageKind, key: string) {
  const storage = getStorage(kind);
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {}
}

export function getLocalStorage(key: string): unknown {
  return loadStorage("localStorage", key);
}

export function updateLocalStorage(key: string, value: unknown) {
  saveStorage("localStorage", key, value);
}

export function removeLocalStorage(key: string) {
  removeStorage("localStorage", key);
}

export function getSessionStorage(key: string): unknown {
  return loadStorage("sessionStorage", key);
}

export function updateSessionStorage(key: string, value: unknown) {
  saveStorage("sessionStorage", key, value);
}

export function removeSessionStorage(key: string) {
  removeStorage("sessionStorage", key);
}
