"use client";

import Link from "next/link";
import { CalendarClock, Users } from "lucide-react";
import type { OfferType, Product, Promotion } from "@/types";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badges";
import { AddControl } from "@/components/products/add-control";
import { FoodImage } from "@/components/products/food-image";
import { openOnPlainClick } from "@/components/products/product-card";

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  "meal-deal": "وجبة توفير",
  combo: "كومبو",
  family: "عرض عائلي",
  limited: "لفترة محدودة",
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("ar", { timeZone: restaurant.timeZone, day: "numeric", month: "long" }).format(new Date(iso));

export function OfferCard({ promotion, product }: { promotion: Promotion; product: Product }) {
  const onOpen = openOnPlainClick(product.id);
  const saving = product.oldPrice && product.oldPrice > product.price ? product.oldPrice - product.price : 0;

  return (
    <article
      data-offer
      className="group relative grid overflow-hidden rounded-lg bg-surface text-ink ring-1 ring-line sm:grid-cols-[42%_1fr]"
    >
      <div className="relative aspect-16/10 sm:aspect-auto sm:min-h-64">
        <FoodImage
          src={product.image}
          alt={product.imageAlt ?? product.name}
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 100vw"
          fill
          className={cn(!product.available && "opacity-60 grayscale")}
          imageClassName="transition-transform duration-500 ease-out-soft group-hover:scale-103"
        />
        <Badge tone={promotion.type === "limited" ? "brand" : "mustard"} className="absolute start-3 top-3">
          {OFFER_TYPE_LABELS[promotion.type]}
        </Badge>
      </div>

      <div className="flex flex-col p-4 sm:p-5">
        <h3 className="text-xl font-extrabold">
          <Link
            href={`/product/${product.slug}`}
            onClick={onOpen}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-ink-muted">{promotion.headline ?? product.description}</p>
        {(product.serves || promotion.endsAt) && (
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold">
            {product.serves && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4 text-brand" aria-hidden="true" />
                يكفي {product.serves === 2 ? "شخصين" : `${product.serves} أشخاص`}
              </span>
            )}
            {promotion.endsAt && (
              <span className="inline-flex items-center gap-1.5 text-ink-soft">
                <CalendarClock className="size-4" aria-hidden="true" />
                حتى {formatDate(promotion.endsAt)}
              </span>
            )}
          </p>
        )}

        {product.includes && (
          <ul className="mt-3 flex flex-col gap-1 text-sm" aria-label="يشمل العرض">
            {product.includes.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span className="tabular min-w-7 rounded-sm bg-cream-deep px-1.5 text-center text-xs leading-6 font-bold">
                  ×{item.quantity}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <div>
            {saving > 0 && (
              <p className="mb-1 inline-flex rounded-sm bg-success-tint px-2 py-0.5 text-xs font-bold text-success">
                وفّر {formatPrice(saving)}
              </p>
            )}
            <p className="flex items-baseline gap-2">
              <span className="tabular text-2xl font-extrabold">{formatPrice(product.price)}</span>
              {saving > 0 && (
                <s className="tabular text-sm text-ink-muted">
                  <span className="sr-only">بدلاً من </span>
                  {formatPrice(product.oldPrice!)}
                </s>
              )}
            </p>
          </div>
          <AddControl product={product} />
        </div>
      </div>
    </article>
  );
}

export function OffersGrid({ items, className }: { items: { promotion: Promotion; product: Product }[]; className?: string }) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      {items.map(({ promotion, product }) => (
        <OfferCard key={promotion.id} promotion={promotion} product={product} />
      ))}
    </div>
  );
}
