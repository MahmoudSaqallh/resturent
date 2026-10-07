"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Category, CategoryId, MenuData, Product, Promotion } from "@/types";
import { cartStore } from "@/features/cart/store";
import { overlayStore } from "@/features/ui/overlays";

export type CatalogStatus = "ready" | "partial" | "loading" | "error";

export interface Catalog {
  categories: Category[];
  menuCategories: Category[];
  products: Product[];
  /** Products shown in menu grids (no hidden items, no offers). */
  menuProducts: Product[];
  promotions: Promotion[];
  productsById: Map<string, Product>;
  categoriesById: Map<CategoryId, Category>;
  /** "partial" = only a page's curated items are loaded (homepage). */
  status: CatalogStatus;
  /** True once every product is known, so cart pricing and search are exact. */
  complete: boolean;
  /** Loads the full catalog if this page started with a partial one. */
  ensureComplete: () => void;
}

const CatalogContext = createContext<Catalog | null>(null);

function build(menu: MenuData) {
  return {
    categories: menu.categories,
    menuCategories: menu.categories.filter((category) => category.showInMenu),
    products: menu.products,
    menuProducts: menu.products.filter(
      (product) => !product.hidden && menu.categories.some((c) => c.id === product.categoryId && c.showInMenu)
    ),
    promotions: menu.promotions,
    productsById: new Map(menu.products.map((product) => [product.id, product])),
    categoriesById: new Map(menu.categories.map((category) => [category.id, category])),
  };
}

interface CatalogProviderProps {
  menu: MenuData;
  /** false when `menu` holds only a page's curated items. */
  complete?: boolean;
  children: ReactNode;
}

export function CatalogProvider({ menu, complete: startsComplete = true, children }: CatalogProviderProps) {
  const [data, setData] = useState(menu);
  const [status, setStatus] = useState<CatalogStatus>(startsComplete ? "ready" : "partial");
  const inFlight = useRef(false);

  const ensureComplete = useCallback(() => {
    if (inFlight.current || status === "ready") return;
    inFlight.current = true;
    setStatus("loading");
    fetch("/api/menu")
      .then((response) => {
        if (!response.ok) throw new Error(`menu ${response.status}`);
        return response.json() as Promise<MenuData>;
      })
      .then((full) => {
        setData(full);
        setStatus("ready");
      })
      .catch(() => setStatus("error"))
      .finally(() => {
        inFlight.current = false;
      });
  }, [status]);

  // Load the rest only when the visitor needs it: an open overlay (search,
  // cart, product sheet, nav) or a saved cart that must be priced.
  useEffect(() => {
    if (status === "ready") return;
    const check = () => {
      const overlays = overlayStore.getState();
      const needed =
        overlays.cartOpen || overlays.searchOpen || overlays.product !== null || cartStore.getState().items.length > 0;
      if (needed) ensureComplete();
    };
    // After a failed fetch, wait for the next interaction instead of retrying in a loop.
    if (status !== "error") check();
    const offOverlay = overlayStore.subscribe(check);
    const offCart = cartStore.subscribe(check);
    return () => {
      offOverlay();
      offCart();
    };
  }, [status, ensureComplete]);

  const value = useMemo<Catalog>(
    () => ({ ...build(data), status, complete: status === "ready", ensureComplete }),
    [data, status, ensureComplete]
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return catalog;
}
