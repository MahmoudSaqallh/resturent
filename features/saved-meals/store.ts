import type { Selections } from "@/types";
import { isRecord } from "@/lib/is-record";
import { createPersistentStore, useStore } from "@/lib/store";
import { lineKey, MAX_NOTE_LENGTH } from "@/features/cart/pricing";

/**
 * "وجبتي المفضلة": a product saved with its exact configuration (size,
 * removed ingredients, extras, sauce, drink, note). Stored on this device;
 * prices are always recomputed from the current menu when it is used.
 */
export interface SavedMeal {
  id: string;
  name: string;
  productId: string;
  selections: Selections;
  note?: string;
  savedAt: number;
}

const MAX_SAVED = 12;

function parseMeals(raw: unknown): SavedMeal[] | null {
  if (!Array.isArray(raw)) return null;
  const meals: SavedMeal[] = [];
  for (const entry of raw) {
    if (!isRecord(entry) || typeof entry.id !== "string" || typeof entry.productId !== "string") continue;
    if (!isRecord(entry.selections)) continue;
    const selections: Selections = {};
    for (const [key, value] of Object.entries(entry.selections)) {
      if (Array.isArray(value) && value.every((v) => typeof v === "string")) selections[key] = value;
    }
    meals.push({
      id: entry.id,
      name: typeof entry.name === "string" ? entry.name.slice(0, 40) : "وجبتي",
      productId: entry.productId,
      selections,
      note: typeof entry.note === "string" ? entry.note.slice(0, MAX_NOTE_LENGTH) : undefined,
      savedAt: typeof entry.savedAt === "number" ? entry.savedAt : 0,
    });
  }
  return meals.slice(0, MAX_SAVED);
}

export const savedMealsStore = createPersistentStore<SavedMeal[]>("jamra:saved-meals:v1", [], parseMeals);

const keyOf = (meal: Pick<SavedMeal, "productId" | "selections" | "note">) =>
  lineKey(meal.productId, meal.selections, meal.note?.trim());

/** Saves (or refreshes) a configuration. Returns false if it was already saved. */
export function saveMeal(input: Omit<SavedMeal, "id" | "savedAt">) {
  const key = keyOf(input);
  let added = false;
  savedMealsStore.setState((meals) => {
    if (meals.some((meal) => keyOf(meal) === key)) return meals;
    added = true;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    return [{ ...input, note: input.note?.trim() || undefined, id, savedAt: Date.now() }, ...meals].slice(0, MAX_SAVED);
  });
  return added;
}

export function removeMeal(id: string) {
  savedMealsStore.setState((meals) => meals.filter((meal) => meal.id !== id));
}

export function renameMeal(id: string, name: string) {
  const clean = name.trim().slice(0, 40);
  if (!clean) return;
  savedMealsStore.setState((meals) => meals.map((meal) => (meal.id === id ? { ...meal, name: clean } : meal)));
}

export function useSavedMeals() {
  return useStore(savedMealsStore, (meals) => meals);
}

export function useIsMealSaved(productId: string, selections: Selections, note?: string) {
  const key = lineKey(productId, selections, note?.trim());
  return useStore(savedMealsStore, (meals) => meals.some((meal) => keyOf(meal) === key));
}
