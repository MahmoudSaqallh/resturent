"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCatalog } from "@/features/menu/catalog";
import { closeAllOverlays } from "@/features/ui/overlays";
import { pruneUnknownProducts } from "@/features/cart/store";
import { pruneUnknownFavorites } from "@/features/favorites/store";
import { applyTableFromQr } from "@/features/ordering/store";
import { showToast } from "@/features/toasts/store";

/** App-wide housekeeping that has no UI of its own. */
export function AppEffects() {
  const pathname = usePathname();
  const { productsById, complete } = useCatalog();

  // Back/forward or any navigation should never leave a sheet open over a new page.
  useEffect(() => {
    closeAllOverlays();
  }, [pathname]);

  // Table QR codes link to any page with `?table=12`: switch to dine-in for this visit.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("table")) return;
    const table = applyTableFromQr(url.searchParams.get("table"), url.searchParams.get("branch"));
    url.searchParams.delete("table");
    url.searchParams.delete("branch");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    if (table) showToast(`أهلاً بك! طلبك مرتبط بطاولة ${table}.`);
  }, [pathname]);

  // Saved carts/favorites may reference items removed from the menu since the last visit.
  // Only prune against the full catalog: a partial one (homepage) would drop valid items.
  useEffect(() => {
    if (!complete) return;
    const known = new Set(productsById.keys());
    pruneUnknownProducts(known);
    pruneUnknownFavorites(known);
  }, [productsById, complete]);

  return null;
}
