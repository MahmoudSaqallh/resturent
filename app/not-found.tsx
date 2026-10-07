import Link from "next/link";
import { SearchX } from "lucide-react";
import { getMenu } from "@/features/menu/api";
import { AppShell } from "@/components/layout/app-shell";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Renders above the route-group layouts, so it brings its own shell. Next
 * embeds this element in every page's payload as the not-found fallback, so
 * it carries categories only; the catalog loads on demand like the homepage.
 */
export default async function NotFound() {
  const { categories } = await getMenu();
  return (
    <AppShell menu={{ categories, products: [], promotions: [] }} complete={false}>
      <div className="container-page py-16">
        <EmptyState
          icon={<SearchX className="size-7" />}
          title="الصفحة غير موجودة"
          description="ربما تغيّر الرابط أو لم يعد هذا الصنف في القائمة."
          action={
            <Link href="/menu" className={buttonClasses({ size: "lg" })}>
              استعرض المنيو
            </Link>
          }
        />
      </div>
    </AppShell>
  );
}
