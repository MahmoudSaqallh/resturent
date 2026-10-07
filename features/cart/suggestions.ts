import type { CategoryId, Product } from "@/types";

const DRINKS: CategoryId[] = ["cold-drinks", "hot-drinks"];

/**
 * "أضف مع طلبك": complements drawn from the curated pairings of what is
 * already in the cart. Missing course types (a drink, a side) come first;
 * items already in the cart are never suggested.
 */
export function getCartSuggestions(cartProducts: Product[], productsById: Map<string, Product>, limit = 3): Product[] {
  if (cartProducts.length === 0) return [];
  const inCart = new Set(cartProducts.map((p) => p.id));
  const categories = new Set(cartProducts.map((p) => p.categoryId));
  const coveredByMeal = categories.has("meals") || categories.has("offers");
  const hasDrink = coveredByMeal || DRINKS.some((c) => categories.has(c));
  const hasSide = coveredByMeal || categories.has("sides");

  const seen = new Set<string>();
  const candidates: Product[] = [];
  for (const product of cartProducts) {
    for (const id of product.pairsWith ?? []) {
      const pair = productsById.get(id);
      if (!pair || seen.has(id) || inCart.has(id) || !pair.available || pair.hidden) continue;
      seen.add(id);
      candidates.push(pair);
    }
  }

  const fillsGap = (p: Product) =>
    (!hasDrink && DRINKS.includes(p.categoryId)) || (!hasSide && p.categoryId === "sides") ? 0 : 1;
  return candidates
    .map((product, index) => ({ product, index }))
    .sort((a, b) => fillsGap(a.product) - fillsGap(b.product) || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.product);
}
