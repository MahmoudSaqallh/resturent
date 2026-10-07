"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Tag } from "lucide-react";
import type { OfferType, Product, Promotion } from "@/types";
import { home } from "@/data/home";
import { useCatalog } from "@/features/menu/catalog";
import { useOffers } from "@/features/menu/use-offers";
import { useMinute } from "@/features/restaurant/use-status";
import { isPromotionLive } from "@/features/menu/availability";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/products/product-card";
import { MealOfTheDay } from "./meal-of-the-day";
import { OffersGrid } from "./offer-card";

type Entry = { promotion: Promotion; product: Product };

const GROUPS: { id: string; title: string; description: string; types: OfferType[] }[] = [
  {
    id: "combos",
    title: "كومبو ووجبات توفير",
    description: "وجبات كاملة بسعر أقل من طلب كل صنف لوحده.",
    types: ["combo", "meal-deal"],
  },
  { id: "family", title: "وجبات عائلية", description: "للمشاركة، وعدد الأشخاص ظاهر على كل عرض.", types: ["family"] },
  { id: "limited", title: "لفترة محدودة", description: "متوفرة لفترة قصيرة فقط.", types: ["limited"] },
];

export function OffersView() {
  const offers = useOffers();
  const { menuProducts, productsById } = useCatalog();
  const minute = useMinute();

  // Offers outside their dates disappear; before hydration nothing is hidden on a guess.
  const live = useMemo(
    () => offers.filter(({ promotion }) => minute === null || isPromotionLive(promotion, minute * 60_000)),
    [offers, minute]
  );
  const groups = GROUPS.map((group) => ({
    ...group,
    items: live.filter((entry: Entry) => group.types.includes(entry.promotion.type)),
  })).filter((group) => group.items.length > 0);
  const newItems = menuProducts.filter((p) => p.isNew && p.available).slice(0, 4);
  const daily = home.mealOfTheDay ? productsById.get(home.mealOfTheDay.productId) : undefined;
  const hasAvailable = live.some((offer) => offer.product.available);

  return (
    <div className="container-page py-8 md:py-12">
      <SectionHeading
        as="h1"
        eyebrow="وفّر أكثر"
        title="العروض"
        description="التوفير ظاهر على كل عرض، محسوباً من أسعار الأصناف نفسها."
      />

      {daily?.available && <MealOfTheDay product={daily} note={home.mealOfTheDay?.note} className="mt-8 lg:max-w-3xl" />}

      {!hasAvailable ? (
        <EmptyState
          icon={<Tag className="size-7" />}
          title="لا توجد عروض حالياً"
          description="تابعنا قريباً، أو اطلب من القائمة الكاملة."
          action={
            <Link href="/menu" className={buttonClasses({ size: "lg" })}>
              استعرض المنيو
            </Link>
          }
        />
      ) : (
        <div className="mt-10 flex flex-col gap-12">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`offers-${group.id}`}>
              <h2 id={`offers-${group.id}`} className="text-xl font-extrabold md:text-2xl">
                {group.title}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">{group.description}</p>
              <Reveal selector="[data-offer]">
                <OffersGrid items={group.items} className="mt-5" />
              </Reveal>
            </section>
          ))}
        </div>
      )}

      {newItems.length > 0 && (
        <section aria-labelledby="offers-new" className="mt-12">
          <h2 id="offers-new" className="text-xl font-extrabold md:text-2xl">
            جديد في المنيو
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {newItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <Link
        href="/build-meal"
        className="group mt-12 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-ink p-5 text-white md:p-7"
      >
        <div>
          <p className="text-sm font-bold text-mustard">ما لقيت العرض المناسب؟</p>
          <p className="mt-1 text-xl font-extrabold md:text-2xl">كوّن وجبتك بنفسك خطوة بخطوة</p>
        </div>
        <span className={buttonClasses({ variant: "primary", size: "lg", className: "rounded-full" })}>
          ابدأ الآن
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
