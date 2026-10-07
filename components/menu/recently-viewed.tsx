"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/store";
import { getStartingPrice } from "@/features/cart/pricing";
import { useCatalog } from "@/features/menu/catalog";
import { recentlyViewedStore, useRecentlyViewedIds } from "@/features/menu/recently-viewed";
import { SectionHeading } from "@/components/ui/section-heading";
import { FoodImage } from "@/components/products/food-image";
import { openOnPlainClick } from "@/components/products/product-card";

function RecentItem({ product }: { product: Product }) {
  const onOpen = openOnPlainClick(product.id);
  const { amount, isFrom } = getStartingPrice(product);
  return (
    <li className="w-40 shrink-0 snap-start sm:w-44">
      <Link href={`/product/${product.slug}`} onClick={onOpen} className="group block">
        <FoodImage
          src={product.image}
          alt={product.imageAlt ?? product.name}
          sizes="176px"
          className="aspect-square w-full rounded-md"
          imageClassName="transition-transform duration-500 ease-out-soft group-hover:scale-103"
        />
        <p className="mt-2 line-clamp-1 text-sm font-bold">{product.name}</p>
        <p className="tabular text-sm text-ink-muted">
          {isFrom && "ابتداءً من "}
          {formatPrice(amount)}
        </p>
      </Link>
    </li>
  );
}

/** Stored on this device only; hidden until there is history. */
export function RecentlyViewed() {
  const hydrated = useHydrated();
  const ids = useRecentlyViewedIds();
  const { productsById } = useCatalog();
  const items = ids.map((id) => productsById.get(id)).filter((p): p is Product => Boolean(p && !p.hidden));
  if (!hydrated || items.length === 0) return null;

  return (
    <section aria-labelledby="recent-title" className="border-t border-line py-10 md:py-12">
      <div className="container-page">
        <SectionHeading id="recent-title" title="شاهدتها مؤخراً">
          <button
            type="button"
            onClick={() => recentlyViewedStore.setState([])}
            className="h-11 text-sm font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            مسح السجل
          </button>
        </SectionHeading>
        <ul className="scrollbar-none relative -mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          {items.map((product) => (
            <RecentItem key={product.id} product={product} />
          ))}
        </ul>
      </div>
    </section>
  );
}
