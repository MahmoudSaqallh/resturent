import type { Metadata } from "next";
import { getMenu } from "@/features/menu/api";
import { parseMenuCategory } from "@/features/menu/menu-url";
import { MenuSection } from "@/components/menu/menu-section";
import { RecentlyViewed } from "@/components/menu/recently-viewed";

export async function generateMetadata({ searchParams }: PageProps<"/menu">): Promise<Metadata> {
  const { category } = await searchParams;
  const { categories } = await getMenu();
  const active = parseMenuCategory(
    category,
    categories.map((c) => c.id)
  );
  const name = categories.find((c) => c.id === active)?.name;
  return {
    title: name ? `${name} — القائمة` : "القائمة",
    description: "القائمة الكاملة: برغر، ساندويشات، وجبات، دجاج، بيتزا، مقبلات، حلويات ومشروبات.",
  };
}

/** Rendered per request so ?category= is in the server HTML (no flash of "all"). */
export default async function MenuPage({ searchParams }: PageProps<"/menu">) {
  // Opting into request-time rendering; MenuSection reads the same params on the client.
  await searchParams;
  return (
    <>
      <MenuSection />
      <RecentlyViewed />
    </>
  );
}
