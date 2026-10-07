import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------
   Minimal external store + persistence.
   React reads it through useSyncExternalStore, so server render and
   hydration use the initial state and the client switches to the
   persisted state right after — no hydration mismatch.
   ------------------------------------------------------------------ */

type Listener = () => void;

export interface Store<T> {
  getState(): T;
  getInitialState(): T;
  setState(next: T | ((prev: T) => T)): void;
  subscribe(listener: Listener): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    getInitialState: () => initial,
    setState(next) {
      const value = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
      if (Object.is(value, state)) return;
      state = value;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/**
 * Subscribe to a slice of a store. The selector must return a stable
 * reference for an unchanged state (a slice or a primitive), not a new
 * object or array on each call.
 */
export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getInitialState())
  );
}

const subscribeNoop = () => () => {};

/** false during SSR and hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

type StorageKind = "local" | "session";

const storageFor = (kind: StorageKind) => (kind === "session" ? window.sessionStorage : window.localStorage);

function readStorage(key: string, kind: StorageKind): unknown {
  try {
    const raw = storageFor(kind).getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown, kind: StorageKind) {
  try {
    storageFor(kind).setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): keep working in memory.
  }
}

/**
 * A store mirrored to web storage. "local" survives restarts and syncs
 * across tabs; "session" lives only for this tab's session. `parse` must
 * validate untrusted stored data and return null when it is unusable.
 */
export function createPersistentStore<T>(
  key: string,
  initial: T,
  parse: (raw: unknown) => T | null,
  kind: StorageKind = "local"
): Store<T> {
  const store = createStore(initial);
  if (typeof window === "undefined") return store;

  const stored = parse(readStorage(key, kind));
  if (stored !== null) store.setState(stored);

  let applyingExternal = false;
  store.subscribe(() => {
    if (!applyingExternal) writeStorage(key, store.getState(), kind);
  });

  // Session storage is per tab, so only local storage syncs across tabs.
  if (kind === "session") return store;
  window.addEventListener("storage", (event) => {
    if (event.key !== key) return;
    let next: T | null = initial;
    if (event.newValue) {
      try {
        next = parse(JSON.parse(event.newValue));
      } catch {
        next = null;
      }
    }
    if (next === null) return;
    applyingExternal = true;
    store.setState(next);
    applyingExternal = false;
  });

  return store;
}
