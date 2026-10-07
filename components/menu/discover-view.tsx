"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import type { Product } from "@/types";
import { home } from "@/data/home";
import { cn } from "@/lib/cn";
import { useViewportReveal } from "@/lib/use-viewport-reveal";
import { useCatalog } from "@/features/menu/catalog";
import { availableMoods, isCollectionLive, matchesPrice, PRICE_RANGES, type Mood, type PriceRange } from "@/features/menu/discover";
import { useMinute } from "@/features/restaurant/use-status";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/products/product-card";

const GRID = "grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4";
const RESULT_LIMIT = 12;

function Row({ title, products, href }: { title: string; products: Product[]; href?: string }) {
  if (products.length === 0) return null;
  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-extrabold md:text-2xl">{title}</h2>
        {href && (
          <Link href={href} className="inline-flex h-11 items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline">
            شوف الكل
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className={GRID}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

/**
 * /discover: a lighter way to browse — by mood and price, plus curated rows
 * (seasonal collections, popular, new). Every row comes from real menu data
 * and disappears when empty.
 */
export function DiscoverView() {
  const { products, menuProducts, productsById } = useCatalog();
  const [mood, setMood] = useState<Mood | null>(null);
  const [price, setPrice] = useState<PriceRange>("all");
  const minute = useMinute();
  const resultsRef = useRef<HTMLDivElement>(null);

  const listed = useMemo(() => products.filter((p) => !p.hidden), [products]);
  const moods = useMemo(() => availableMoods(listed), [listed]);
  const filtering = mood !== null || price !== "all";
  const results = useMemo(() => {
    if (!filtering) return [];
    const rule = moods.find((m) => m.id === mood);
    return listed.filter((p) => (!rule || rule.test(p)) && matchesPrice(p, price));
  }, [filtering, listed, moods, mood, price]);

  const collections = useMemo(
    () =>
      minute === null
        ? []
        : home.collections
            .filter((c) => isCollectionLive(c, minute * 60_000))
            .map((c) => ({ ...c, products: c.productIds.map((id) => productsById.get(id)).filter((p): p is Product => Boolean(p && !p.hidden)) }))
            .filter((c) => c.products.length > 0),
    [minute, productsById]
  );
  const popular = menuProducts.filter((p) => p.popular && p.available).slice(0, 4);
  const fresh = menuProducts.filter((p) => p.isNew && p.available).slice(0, 4);

  useViewportReveal(resultsRef, { selector: "[data-card]", revealKey: `${mood}:${price}` });

  const chip = (active: boolean) =>
    cn(
      "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
      active ? "bg-ink text-cream" : "bg-surface text-ink-soft ring-1 ring-line hover:ring-ink-muted"
    );

  return (
    <div className="container-page py-8 md:py-12">
      <SectionHeading as="h1" eyebrow="مش عارف شو تطلب؟" title="اكتشف" description="اختر مزاجك أو ميزانيتك، ونرتب لك الخيارات." />

      <div className="mt-6 flex flex-col gap-3">
        <div role="group" aria-label="المزاج" className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
          {moods.map((m) => (
            <button key={m.id} type="button" aria-pressed={mood === m.id} onClick={() => setMood(mood === m.id ? null : m.id)} className={chip(mood === m.id)}>
              {mood === m.id && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="discover-price" className="text-sm font-semibold text-ink-soft">
            السعر
          </label>
          <select
            id="discover-price"
            value={price}
            onChange={(e) => setPrice(e.target.value as PriceRange)}
            className="h-10 rounded-full border border-line-strong bg-surface px-3.5 text-sm font-semibold focus:border-ink focus:outline-none"
          >
            {PRICE_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
          {filtering && (
            <button
              type="button"
              onClick={() => {
                setMood(null);
                setPrice("all");
              }}
              className="h-10 px-1 text-sm font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline"
            >
              مسح الاختيار
            </button>
          )}
        </div>
      </div>

      <div ref={resultsRef} className="mt-8 flex flex-col gap-12">
        <p className="sr-only" aria-live="polite">
          {filtering ? `${results.length} صنف مطابق` : ""}
        </p>
        {filtering ? (
          results.length > 0 ? (
            <section aria-label="النتائج">
              <div className={GRID}>
                {results.slice(0, RESULT_LIMIT).map((product) => (
                  <ProductCard key={product.id} product={product} showCategory />
                ))}
              </div>
              {results.length > RESULT_LIMIT && (
                <p className="mt-4 text-sm text-ink-muted">
                  و{results.length - RESULT_LIMIT} أصناف أخرى في{" "}
                  <Link href="/menu" className="font-semibold text-ink underline underline-offset-4">
                    المنيو الكامل
                  </Link>
                  .
                </p>
              )}
            </section>
          ) : (
            <EmptyState
              title="لا توجد أصناف بهذا الاختيار"
              description="جرّب سعراً آخر أو مزاجاً مختلفاً."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setMood(null);
                    setPrice("all");
                  }}
                >
                  مسح الاختيار
                </Button>
              }
            />
          )
        ) : (
          <>
            {collections.map((c) => (
              <Row key={c.id} title={c.title} products={c.products.slice(0, 4)} />
            ))}
            <Row title="الأكثر طلباً" products={popular} href="/menu" />
            <Row title="جديد في المنيو" products={fresh} />
            <Link
              href="/offers"
              className="group flex flex-wrap items-center justify-between gap-4 rounded-lg bg-brand-tint p-5 md:p-6"
            >
              <span>
                <span className="block text-lg font-extrabold">العروض</span>
                <span className="text-sm text-ink-soft">وجبات كاملة بسعر أقل، والتوفير ظاهر على كل عرض.</span>
              </span>
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
