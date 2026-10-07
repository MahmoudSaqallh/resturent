"use client";

import { useMemo } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { useHydrated } from "@/lib/store";
import { useFavorites } from "@/features/favorites/store";
import { useSavedMeals } from "@/features/saved-meals/store";
import { SavedMealsList } from "./saved-meals";
import { useCatalog } from "@/features/menu/catalog";
import { useGoToMenu } from "@/features/menu/use-go-to-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGridSkeleton } from "@/components/ui/skeletons";
import { ProductCard } from "@/components/products/product-card";
import { MEAL_FORMS, pluralize } from "@/lib/format";

export function FavoritesView() {
  const hydrated = useHydrated();
  const favorites = useFavorites();
  const savedMeals = useSavedMeals();
  const { productsById } = useCatalog();
  const goToMenu = useGoToMenu();

  const products = useMemo(
    () => favorites.map((f) => productsById.get(f.productId)).filter((p): p is Product => Boolean(p)),
    [favorites, productsById]
  );

  return (
    <div className="container-page py-8 md:py-12">
      <SectionHeading
        as="h1"
        title="المفضلة"
        description={
          hydrated && products.length > 0
            ? `${pluralize(products.length, MEAL_FORMS)} محفوظة على هذا الجهاز.`
            : "احفظ وجباتك المفضلة لتطلبها بسرعة في المرة القادمة."
        }
      />
      <div className="mt-8">
        {!hydrated ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 && savedMeals.length === 0 ? (
          <EmptyState
            icon={<Heart className="size-7" />}
            title="ما أضفت أي وجبات للمفضلة بعد"
            description="اضغط على القلب لحفظ أي وجبة، أو احفظ وجبة بخياراتك من صفحتها لتطلبها بضغطة."
            action={
              <Button size="lg" onClick={() => goToMenu()}>
                استكشف القائمة
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-10">
            {savedMeals.length > 0 && <SavedMealsList meals={savedMeals} />}
            {products.length > 0 && (
              <section aria-label="الوجبات المفضلة">
                {savedMeals.length > 0 && <h2 className="mb-4 text-xl font-extrabold">أصناف أعجبتك</h2>}
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} showCategory />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
