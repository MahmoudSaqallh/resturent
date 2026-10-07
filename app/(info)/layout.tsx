import { getMenu } from "@/features/menu/api";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Content pages (about, FAQ, branches, order lookup): no products up front.
 * Search, the cart and product sheets load the catalog on demand.
 */
export default async function InfoLayout({ children }: LayoutProps<"/">) {
  const { categories } = await getMenu();
  return (
    <AppShell menu={{ categories, products: [], promotions: [] }} complete={false}>
      {children}
    </AppShell>
  );
}
