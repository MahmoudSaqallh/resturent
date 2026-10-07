import type { ReactNode } from "react";
import type { MenuData } from "@/types";
import { CatalogProvider } from "@/features/menu/catalog";
import { Header } from "@/components/navigation/header";
import { MobileCartBar } from "@/components/cart/mobile-cart-bar";
import { SiteNotices } from "@/components/ordering/site-notices";
import { AppEffects } from "./app-effects";
import { Footer } from "./footer";
import { LazyOverlays } from "./lazy-overlays";

/**
 * Site chrome + global overlays. Route-group layouts choose the catalog:
 * the full menu for shopping pages, a curated subset (or none) elsewhere.
 */
export function AppShell({ menu, complete, children }: { menu: MenuData; complete: boolean; children: ReactNode }) {
  return (
    <CatalogProvider menu={menu} complete={complete}>
      <Header />
      <SiteNotices />
      {/* At least one viewport tall: client-only views (cart-dependent pages) can swap a skeleton for
          shorter content without pulling the footer up into view (no layout shift). */}
      <main id="main" tabIndex={-1} className="min-h-[calc(100svh-var(--header-h))] flex-1 outline-none">
        {children}
      </main>
      <Footer />
      <MobileCartBar />
      <LazyOverlays />
      <AppEffects />
    </CatalogProvider>
  );
}
