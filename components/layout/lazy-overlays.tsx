"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useOverlay } from "@/features/ui/overlays";

/* The cart drawer, product sheet, search and mobile menu are split out of
   the initial bundle. Each mounts the first time it opens and stays mounted
   (so its close animation and state survive); the chunks are fetched when
   the browser is idle, so the first open is still instant. */

const loadCart = () => import("@/components/cart/cart-drawer");
const loadProduct = () => import("@/components/products/product-sheet");
const loadSearch = () => import("@/components/menu/search-dialog");
const loadNav = () => import("@/components/navigation/mobile-nav");

const CartDrawer = dynamic(() => loadCart().then((m) => m.CartDrawer), { ssr: false });
const ProductSheet = dynamic(() => loadProduct().then((m) => m.ProductSheet), { ssr: false });
const SearchDialog = dynamic(() => loadSearch().then((m) => m.SearchDialog), { ssr: false });
const MobileNav = dynamic(() => loadNav().then((m) => m.MobileNav), { ssr: false });

/** true from the first time `active` is true. */
function useLatch(active: boolean) {
  const [latched, setLatched] = useState(active);
  if (active && !latched) setLatched(true);
  return latched || active;
}

export function LazyOverlays() {
  const cart = useLatch(useOverlay("cartOpen"));
  const product = useLatch(useOverlay("product") !== null);
  const search = useLatch(useOverlay("searchOpen"));
  const nav = useLatch(useOverlay("navOpen"));

  useEffect(() => {
    const preload = () => {
      loadCart();
      loadProduct();
      loadSearch();
      loadNav();
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preload, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(preload, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {cart && <CartDrawer />}
      {product && <ProductSheet />}
      {search && <SearchDialog />}
      {nav && <MobileNav />}
    </>
  );
}
