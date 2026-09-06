"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Bring-Your-Own-Key (BYOK) store.
 *
 * Judges and visitors can paste their own API keys to test the live
 * integrations without the maintainer sharing theirs (or burning their quota).
 *
 * Keys live ONLY in the browser's localStorage and are sent per-request as
 * headers to our own API routes, which forward them to the provider and never
 * persist them. They are never written to the server environment or any file.
 */

export type ByokProvider = "elevenlabs" | "gemini";

const STORAGE_PREFIX = "openpledge.byok.";

/** Request header names our API routes read for a per-request override key. */
export const BYOK_HEADERS: Record<ByokProvider, string> = {
  elevenlabs: "x-elevenlabs-key",
  gemini: "x-gemini-key",
};

function storageKey(provider: ByokProvider): string {
  return `${STORAGE_PREFIX}${provider}`;
}

// --- A tiny cross-component reactive store over localStorage ----------------

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

export function getByokKey(provider: ByokProvider): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(storageKey(provider)) ?? "";
}

export function setByokKey(provider: ByokProvider, value: string): void {
  if (typeof window === "undefined") return;
  const trimmed = value.trim();
  if (trimmed) {
    window.localStorage.setItem(storageKey(provider), trimmed);
  } else {
    window.localStorage.removeItem(storageKey(provider));
  }
  emit();
}

/** Build the headers object carrying any keys the user has stored. */
export function byokHeaders(providers: ByokProvider[] = ["elevenlabs", "gemini"]): HeadersInit {
  const headers: Record<string, string> = {};
  for (const p of providers) {
    const key = getByokKey(p);
    if (key) headers[BYOK_HEADERS[p]] = key;
  }
  return headers;
}

/** Reactive hook: read + set a provider key, re-rendering on change. */
export function useByokKey(provider: ByokProvider): [string, (value: string) => void] {
  const key = useSyncExternalStore(
    subscribe,
    () => getByokKey(provider),
    () => ""
  );
  const set = useCallback((value: string) => setByokKey(provider, value), [provider]);
  return [key, set];
}
