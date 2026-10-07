import { createPersistentStore, useStore } from "@/lib/store";

const MAX_RECENT = 10;

const parseRecent = (raw: unknown) =>
  Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string").slice(0, MAX_RECENT) : null;

export const recentlyViewedStore = createPersistentStore<string[]>("jamra:recent:v1", [], parseRecent);

export function markViewed(productId: string) {
  recentlyViewedStore.setState((ids) =>
    ids[0] === productId ? ids : [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX_RECENT)
  );
}

export function useRecentlyViewedIds() {
  return useStore(recentlyViewedStore, (ids) => ids);
}
