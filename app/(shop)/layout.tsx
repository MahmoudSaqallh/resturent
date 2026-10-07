import { getMenu } from "@/features/menu/api";
import { AppShell } from "@/components/layout/app-shell";

/** Menu, product, cart and checkout pages: full catalog up front. */
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const menu = await getMenu();
  return (
    <AppShell menu={menu} complete>
      {children}
    </AppShell>
  );
}
