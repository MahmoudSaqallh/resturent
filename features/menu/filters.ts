import type { Product } from "@/types";

export type MenuFilter = "available" | "popular" | "spicy" | "offers" | "vegetarian" | "vegan" | "gluten-free";

const RULES: Record<MenuFilter, { label: string; test: (product: Product) => boolean }> = {
  available: { label: "متوفر الآن", test: (p) => p.available },
  popular: { label: "الأكثر طلباً", test: (p) => Boolean(p.popular) },
  spicy: { label: "حار", test: (p) => (p.spicyLevel ?? 0) > 0 },
  offers: { label: "عليها خصم", test: (p) => p.oldPrice !== undefined && p.oldPrice > p.price },
  vegetarian: { label: "نباتي", test: (p) => Boolean(p.dietary?.includes("vegetarian")) },
  vegan: { label: "نباتي صرف", test: (p) => Boolean(p.dietary?.includes("vegan")) },
  "gluten-free": { label: "خالٍ من الغلوتين", test: (p) => Boolean(p.dietary?.includes("gluten-free")) },
};

const ORDER: MenuFilter[] = ["available", "popular", "spicy", "offers", "vegetarian", "vegan", "gluten-free"];

/**
 * Filters backed by real data only: a chip appears when at least one product
 * matches it, and "available now" only when something is actually unavailable.
 */
export function getMenuFilters(products: Product[]) {
  return ORDER.filter((id) => {
    const matches = products.filter(RULES[id].test).length;
    return id === "available" ? matches > 0 && matches < products.length : matches > 0;
  }).map((id) => ({ id, label: RULES[id].label }));
}

export function applyMenuFilters(products: Product[], active: ReadonlySet<MenuFilter>) {
  if (active.size === 0) return products;
  return products.filter((product) => [...active].every((id) => RULES[id].test(product)));
}
