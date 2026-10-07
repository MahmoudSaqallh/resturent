import { home } from "@/data/home";
import { COMBO_BUILDER_ID } from "@/data/ids";
import type { Category, MenuData, Product } from "@/types";
import { getMenu } from "@/features/menu/api";
import { isPromotionLive } from "@/features/menu/availability";

const isListed = (p: Product | undefined): p is Product => Boolean(p && p.available && !p.hidden);

/**
 * Everything the homepage renders, resolved on the server against the real
 * menu. Only these items (not the whole catalog) reach the browser.
 */
export async function getHomeSelection() {
  const { categories, products, promotions } = await getMenu();
  const byId = new Map(products.map((p) => [p.id, p]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const shortcuts = home.categoryIds.map((id) => categoryById.get(id)).filter((c): c is Category => Boolean(c));

  const configured = home.bestSellerIds.map((id) => byId.get(id)).filter(isListed);
  const bestSellers = (configured.length > 0 ? configured : products.filter((p) => p.popular && isListed(p))).slice(0, 4);

  const featured = promotions.find((p) => p.featured && isPromotionLive(p, Date.now()));
  const featuredProduct = featured ? byId.get(featured.productId) : undefined;
  const offer = featured && featuredProduct ? { promotion: featured, product: featuredProduct } : null;

  const combo = byId.get(COMBO_BUILDER_ID);
  const build = combo?.available
    ? {
        saving: combo.bundleDiscount ?? 0,
        steps: home.buildSteps.map((step) => ({ ...step, image: byId.get(step.productId)?.image })),
      }
    : null;

  const dailyProduct = home.mealOfTheDay ? byId.get(home.mealOfTheDay.productId) : undefined;
  const mealOfTheDay = isListed(dailyProduct) ? { product: dailyProduct, note: home.mealOfTheDay?.note } : null;

  return { categories, shortcuts, bestSellers, offer, build, mealOfTheDay };
}

/** Partial catalog for the homepage: categories + the products it can add to the cart. */
export async function getHomeCatalog(): Promise<MenuData> {
  const { categories, bestSellers, offer, mealOfTheDay } = await getHomeSelection();
  const products = [
    ...bestSellers,
    ...(offer ? [offer.product] : []),
    ...(mealOfTheDay ? [mealOfTheDay.product] : []),
  ];
  return {
    categories,
    products: [...new Map(products.map((p) => [p.id, p])).values()],
    promotions: offer ? [offer.promotion] : [],
  };
}
