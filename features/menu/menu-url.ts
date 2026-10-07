import type { CategoryId } from "@/types";

/** Active menu filter; "all" shows every category grouped. */
export type MenuCategory = CategoryId | "all";

export const MENU_PATH = "/menu";

/** /menu or /menu?category=burgers */
export function menuHref(category?: MenuCategory) {
  return category && category !== "all" ? `${MENU_PATH}?category=${category}` : MENU_PATH;
}

/** Untrusted ?category= value → a known menu category, else "all". */
export function parseMenuCategory(value: string | string[] | null | undefined, known: readonly string[]): MenuCategory {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && known.includes(raw) ? (raw as CategoryId) : "all";
}
