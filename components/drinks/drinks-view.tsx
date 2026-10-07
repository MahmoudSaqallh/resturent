"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { DrinkType, Product, Selections } from "@/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useViewportReveal } from "@/lib/use-viewport-reveal";
import { useCatalog } from "@/features/menu/catalog";
import { describeSelections, getUnitPrice, withDefaults } from "@/features/cart/pricing";
import { openProduct } from "@/features/ui/overlays";
import { SectionHeading } from "@/components/ui/section-heading";
import { AnimatedPrice } from "@/components/ui/price";
import { SpicyIndicator } from "@/components/ui/badges";
import { AddControl } from "@/components/products/add-control";
import { FavoriteButton } from "@/components/products/favorite-button";
import { FoodImage } from "@/components/products/food-image";
import { openOnPlainClick } from "@/components/products/product-card";

const DRINK_TYPES: { id: DrinkType | "all"; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "soda", label: "مشروبات غازية" },
  { id: "juice", label: "عصائر" },
  { id: "water", label: "مياه" },
  { id: "cold", label: "مشروبات باردة" },
  { id: "coffee", label: "قهوة" },
  { id: "hot", label: "مشروبات ساخنة" },
];

/** Drink card with the size picked right on the card. */
function DrinkCard({ product }: { product: Product }) {
  const onOpen = openOnPlainClick(product.id);
  const sizeOption = product.options?.find((option) => option.kind === "size");
  const defaults = useMemo(() => withDefaults(product), [product]);
  const [size, setSize] = useState(defaults.size?.[0]);
  const preset: Selections = useMemo(
    () => (sizeOption && size ? { ...defaults, [sizeOption.id]: [size] } : defaults),
    [defaults, sizeOption, size]
  );
  // Other defaults (flavour, sugar, milk) are shown so nothing is added silently.
  const otherChoices = describeSelections(
    product,
    Object.fromEntries(Object.entries(defaults).filter(([key]) => key !== sizeOption?.id))
  ).map((line) => line.replace(/^[^:]+:\s*/, ""));

  return (
    <article data-card className="group relative flex flex-col rounded-lg bg-surface ring-1 ring-line">
      <div className="relative aspect-4/3">
        <FoodImage
          src={product.image}
          alt={product.imageAlt ?? product.name}
          sizes="(min-width: 1280px) 300px, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
          fill
          className={cn("rounded-t-lg", !product.available && "opacity-60 grayscale")}
          imageClassName="transition-transform duration-500 ease-out-soft group-hover:scale-103"
        />
        <FavoriteButton product={product} size="sm" className="absolute end-2.5 top-2.5" />
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-base leading-snug font-bold">
          <Link
            href={`/product/${product.slug}`}
            onClick={onOpen}
            className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand"
          >
            {product.name}
          </Link>
        </h3>
        <SpicyIndicator level={product.spicyLevel} />
        <p className="mt-1 line-clamp-1 text-sm text-ink-muted">{product.description}</p>

        {sizeOption && product.available && (
          <fieldset className="relative z-10 mt-3">
            <legend className="sr-only">الحجم</legend>
            <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-cream-deep p-1">
              {sizeOption.choices.map((choice) => {
                const checked = size === choice.id;
                return (
                  <label
                    key={choice.id}
                    className={cn(
                      "flex h-9 cursor-pointer items-center justify-center rounded-full px-2 text-xs font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-brand",
                      checked ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
                    )}
                  >
                    <input
                      type="radio"
                      name={`${product.id}-size`}
                      value={choice.id}
                      checked={checked}
                      onChange={() => setSize(choice.id)}
                      className="sr-only"
                    />
                    {choice.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
        {otherChoices.length > 0 && product.available && (
          <p className="mt-2 text-xs text-ink-muted">
            {otherChoices.join(" · ")} —{" "}
            <button
              type="button"
              onClick={() => openProduct(product.id)}
              className="relative z-10 inline-flex min-h-6 items-center font-semibold text-ink underline underline-offset-2"
            >
              تخصيص
            </button>
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <AnimatedPrice amount={getUnitPrice(product, preset)} className="text-lg font-bold" />
          <AddControl product={product} preset={preset} />
        </div>
      </div>
    </article>
  );
}

export function DrinksView() {
  const { products } = useCatalog();
  const [type, setType] = useState<DrinkType | "all">("all");
  const gridRef = useRef<HTMLDivElement>(null);
  const drinks = useMemo(() => products.filter((p) => p.drinkType && !p.hidden), [products]);
  const types = DRINK_TYPES.filter((t) => t.id === "all" || drinks.some((d) => d.drinkType === t.id));
  const shown = type === "all" ? drinks : drinks.filter((d) => d.drinkType === type);

  useViewportReveal(gridRef, { selector: "[data-card]", revealKey: type });

  return (
    <div className="container-page py-8 md:py-12">
      <SectionHeading
        as="h1"
        eyebrow="بارد أو ساخن"
        title="المشروبات"
        description={`اختر الحجم مباشرة من البطاقة. الأسعار تبدأ من ${formatPrice(Math.min(...drinks.map((d) => d.price)))}.`}
      />
      <nav aria-label="أنواع المشروبات" className="sticky top-(--header-h) z-30 -mx-4 mt-6 border-b border-line bg-cream px-4 md:-mx-6 md:px-6 xl:mx-0 xl:px-0">
        <ul className="scrollbar-none relative flex gap-2 overflow-x-auto py-2.5">
          {types.map((t) => (
            <li key={t.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={type === t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                  type === t.id ? "bg-ink text-cream" : "bg-surface text-ink-soft ring-1 ring-line hover:text-ink"
                )}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div ref={gridRef} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((product) => (
          <DrinkCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
