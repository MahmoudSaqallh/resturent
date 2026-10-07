import { getHomeCatalog } from "@/features/home/selection";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Homepage: ships only the curated items it shows. The rest of the catalog
 * is fetched from /api/menu when the visitor opens search, the cart or a
 * product, or already has items in the cart.
 */
export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const menu = await getHomeCatalog();
  return (
    <AppShell menu={menu} complete={false}>
      {children}
    </AppShell>
  );
}
