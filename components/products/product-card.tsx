"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import type { Product } from "@/types";
import { cn } from "@/lib/cn";
import { getStartingPrice } from "@/features/cart/pricing";
import { useCatalog } from "@/features/menu/catalog";
import { openProduct } from "@/features/ui/overlays";
import { Badge, getPrimaryBadge, SpicyIndicator, StockNote } from "@/components/ui/badges";
import { Price } from "@/components/ui/price";
import { AddControl } from "./add-control";
import { FavoriteButton } from "./favorite-button";
import { FoodImage } from "./food-image";

/** Opens the quick-view sheet on plain clicks; modified clicks follow the real link. */
export function openOnPlainClick(productId: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    openProduct(productId);
  };
}

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
  /** Hide the promo badge where the section already says it (e.g. "الأكثر طلباً"). */
  showBadge?: boolean;
  className?: string;
}

/**
 * Phones: horizontal row (text + thumbnail) so names and prices stay large.
 * From `sm`: vertical card with the photo on top.
 */
export function ProductCard({ product, showCategory, showBadge = true, className }: ProductCardProps) {
  const { categoriesById } = useCatalog();
  const onOpen = openOnPlainClick(product.id);
  const { amount, isFrom } = getStartingPrice(product);
  const badge = showBadge ? getPrimaryBadge(product) : null;

  return (
    <article
      data-card
      className={cn(
        "group relative flex flex-row-reverse gap-3 rounded-lg bg-surface p-2.5 ring-1 ring-line transition-[box-shadow,transform] duration-200 ease-out-soft hover:shadow-raised sm:flex-col sm:gap-0 sm:p-0 sm:hover:-translate-y-0.5",
        className
      )}
    >
      <div className="relative size-28 shrink-0 sm:aspect-4/3 sm:size-auto sm:w-full">
        <FoodImage
          src={product.image}
          alt={product.imageAlt ?? product.name}
          sizes="(min-width: 1280px) 300px, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 112px"
          className={cn("size-full rounded-md sm:rounded-b-none sm:rounded-t-lg", !product.available && "opacity-60 grayscale")}
          imageClassName="transition-transform duration-500 ease-out-soft group-hover:scale-103"
        />
        {badge && (
          <Badge tone={badge.tone} className="absolute start-2.5 top-2.5 max-sm:hidden">
            {badge.label}
          </Badge>
        )}
        <FavoriteButton product={product} size="sm" className="absolute end-1.5 top-1.5 sm:end-2.5 sm:top-2.5" />
        {!product.available && (
          <span className="absolute inset-x-0 bottom-0 rounded-b-md bg-ink/80 py-1 text-center text-xs font-bold text-white sm:rounded-b-none">
            غير متوفر حالياً
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col sm:px-3.5 sm:pt-3 sm:pb-3.5">
        {badge && (
          <Badge tone={badge.tone} className="mb-1.5 self-start sm:hidden">
            {badge.label}
          </Badge>
        )}
        {showCategory && (
          <p className="mb-0.5 text-xs font-medium text-ink-muted">{categoriesById.get(product.categoryId)?.name}</p>
        )}
        <h3 className="text-base leading-snug font-bold">
          <Link
            href={`/product/${product.slug}`}
            onClick={onOpen}
            className="line-clamp-2 after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand"
          >
            {product.name}
          </Link>
        </h3>
        <SpicyIndicator level={product.spicyLevel} className="mt-1" />
        <StockNote product={product} className="mt-1" />
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-muted">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <Price amount={amount} oldPrice={product.oldPrice} isFrom={isFrom} size="lg" />
          <AddControl product={product} />
        </div>
      </div>
    </article>
  );
}
