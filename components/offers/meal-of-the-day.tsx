"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { cn } from "@/lib/cn";
import { getStartingPrice } from "@/features/cart/pricing";
import { Price } from "@/components/ui/price";
import { AddControl } from "@/components/products/add-control";
import { FoodImage } from "@/components/products/food-image";
import { openOnPlainClick } from "@/components/products/product-card";

/**
 * "وجبة اليوم" — rendered only when the restaurant configures one
 * (data/home.ts → mealOfTheDay) and the product is available.
 */
export function MealOfTheDay({ product, note, className }: { product: Product; note?: string; className?: string }) {
  const starting = getStartingPrice(product);
  return (
    <article
      aria-labelledby="meal-of-the-day"
      className={cn(
        "relative grid grid-cols-[7.5rem_1fr] items-center gap-4 rounded-lg bg-surface p-3 ring-1 ring-line sm:grid-cols-[12rem_1fr] sm:gap-6 sm:p-4",
        className
      )}
    >
      <FoodImage
        src={product.image}
        alt={product.imageAlt ?? product.name}
        sizes="(min-width: 640px) 192px, 120px"
        className="aspect-4/3 w-full rounded-md"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm font-semibold text-brand-ink">وجبة اليوم</p>
        <h2 id="meal-of-the-day" className="text-lg font-extrabold sm:text-xl">
          <Link
            href={`/product/${product.slug}`}
            onClick={openOnPlainClick(product.id)}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-brand"
          >
            {product.name}
          </Link>
        </h2>
        <p className="line-clamp-2 text-sm text-ink-muted">{note ?? product.description}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <Price amount={starting.amount} oldPrice={product.oldPrice} isFrom={starting.isFrom} />
          <AddControl product={product} className="relative z-10" />
        </div>
      </div>
    </article>
  );
}
