import type { FavoriteItem } from "@/types";
import { isRecord } from "@/lib/is-record";
import { createPersistentStore, useStore } from "@/lib/store";

function parseFavorites(raw: unknown): FavoriteItem[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .filter(isRecord)
    .filter((entry) => typeof entry.productId === "string")
    .map((entry) => ({
      productId: entry.productId as string,
      addedAt: typeof entry.addedAt === "number" ? entry.addedAt : 0,
    }));
}

/** Persisted locally until customer accounts exist. */
export const favoritesStore = createPersistentStore<FavoriteItem[]>("jamra:favorites:v1", [], parseFavorites);

/** Returns true when the product is now a favorite. */
export function toggleFavorite(productId: string): boolean {
  const exists = favoritesStore.getState().some((item) => item.productId === productId);
  favoritesStore.setState((items) =>
    exists ? items.filter((item) => item.productId !== productId) : [{ productId, addedAt: Date.now() }, ...items]
  );
  return !exists;
}

export function pruneUnknownFavorites(knownIds: Set<string>) {
  const items = favoritesStore.getState();
  if (items.every((item) => knownIds.has(item.productId))) return;
  favoritesStore.setState(items.filter((item) => knownIds.has(item.productId)));
}

export function useFavorites() {
  return useStore(favoritesStore, (items) => items);
}

export function useIsFavorite(productId: string) {
  return useStore(favoritesStore, (items) => items.some((item) => item.productId === productId));
}

export function useFavoritesCount() {
  return useStore(favoritesStore, (items) => items.length);
}
