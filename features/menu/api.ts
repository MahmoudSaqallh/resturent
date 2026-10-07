import { menu } from "@/data/menu";
import type { MenuData, Product } from "@/types";

/**
 * Menu data access. Today it reads the bundled catalog; swap the body for a
 * fetch to the restaurant's backend/CMS without touching the UI.
 */
export async function getMenu(): Promise<MenuData> {
  return menu;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { products } = await getMenu();
  return products.find((product) => product.slug === slug);
}
