import type { Collection, Product } from "@/types";
import { getStartingPrice } from "@/features/cart/pricing";

/* Secondary ways to browse, derived only from real menu data (categories,
   spice level, prices). Normal categories on /menu stay the primary path. */

export type Mood = "light" | "hungry" | "spicy" | "sweet" | "drink";

export const MOODS: { id: Mood; label: string; test: (p: Product) => boolean }[] = [
  { id: "light", label: "وجبة خفيفة", test: (p) => p.categoryId === "sides" || p.categoryId === "sandwiches" },
  {
    id: "hungry",
    label: "جوعان كثير",
    test: (p) => p.categoryId === "meals" || p.categoryId === "pizza" || (p.categoryId === "offers" && Boolean(p.serves)),
  },
  { id: "spicy", label: "حار", test: (p) => (p.spicyLevel ?? 0) > 0 },
  { id: "sweet", label: "حلو", test: (p) => p.categoryId === "desserts" },
  { id: "drink", label: "مشروب", test: (p) => p.categoryId === "cold-drinks" || p.categoryId === "hot-drinks" },
];

export type PriceRange = "all" | "low" | "mid" | "high";

export const PRICE_RANGES: { id: PriceRange; label: string; test: (price: number) => boolean }[] = [
  { id: "all", label: "كل الأسعار", test: () => true },
  { id: "low", label: "حتى 15 ₪", test: (price) => price <= 15 },
  { id: "mid", label: "15 – 30 ₪", test: (price) => price > 15 && price <= 30 },
  { id: "high", label: "أكثر من 30 ₪", test: (price) => price > 30 },
];

export function matchesPrice(product: Product, range: PriceRange) {
  const rule = PRICE_RANGES.find((r) => r.id === range);
  return rule ? rule.test(getStartingPrice(product).amount) : true;
}

/** Moods that have at least one listed product (no empty chips). */
export function availableMoods(products: Product[]) {
  return MOODS.filter((mood) => products.some((p) => mood.test(p)));
}

export function isCollectionLive(collection: Collection, now: number) {
  if (collection.startsAt && Date.parse(collection.startsAt) > now) return false;
  if (collection.endsAt && Date.parse(collection.endsAt) <= now) return false;
  return collection.productIds.length > 0;
}
