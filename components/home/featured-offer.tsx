"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { Product, Promotion } from "@/types";
import { formatPrice } from "@/lib/format";
import { quickAdd } from "@/features/cart/actions";
import { openCart } from "@/features/ui/overlays";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { FoodImage } from "@/components/products/food-image";
import { OFFER_TYPE_LABELS } from "@/components/offers/offer-card";
import { isPromotionLive } from "@/features/menu/availability";
import { useMinute } from "@/features/restaurant/use-status";

/** One featured promotion: text and a 3:2 photo on a soft accent panel. Savings = oldPrice − price. */
export function FeaturedOffer({ promotion, product }: { promotion: Promotion; product: Product }) {
  // The homepage is static: re-check dated offers in the browser so an expired one never shows.
  const minute = useMinute();
  const expired = minute !== null && !isPromotionLive(promotion, minute * 60_000);
  const saving = product.oldPrice && product.oldPrice > product.price ? product.oldPrice - product.price : 0;
  const order = () => {
    if (quickAdd(product)) openCart();
  };

  if (expired) return null;
  return (
    <section id="offer" aria-labelledby="offer-title" className="section-y">
      <div className="container-page">
        <Reveal className="grid items-center overflow-hidden rounded-lg border border-brand/10 bg-brand-tint lg:grid-cols-2">
          <div className="p-6 md:p-10 lg:p-12">
            <p className="text-sm font-semibold text-brand-ink">العرض المميز · {OFFER_TYPE_LABELS[promotion.type]}</p>
            <h2 id="offer-title" className="mt-2 text-section font-extrabold">
              {product.name}
            </h2>
            <p className="mt-2 text-ink-soft">{promotion.headline ?? product.description}</p>

            {product.includes && (
              <ul className="mt-6 max-w-md divide-y divide-ink/10 border-y border-ink/10 text-sm" aria-label="يشمل العرض">
                {product.includes.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-4 py-2.5">
                    <span>{item.label}</span>
                    <span className="tabular font-semibold text-ink-muted">×{item.quantity}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="tabular text-3xl font-extrabold md:text-4xl">{formatPrice(product.price)}</span>
              {saving > 0 && (
                <>
                  <s className="tabular text-ink-muted">
                    <span className="sr-only">بدلاً من </span>
                    {formatPrice(product.oldPrice!)}
                  </s>
                  <span className="rounded-sm bg-success-tint px-2 py-0.5 text-sm font-bold text-success">
                    وفّر {formatPrice(saving)}
                  </span>
                </>
              )}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              {product.available ? (
                <button type="button" onClick={order} className={buttonClasses({ variant: "primary", size: "lg", className: "px-7 max-sm:w-full" })}>
                  <ShoppingBag className="size-4" aria-hidden="true" />
                  اطلب العرض
                </button>
              ) : (
                <p className="font-semibold text-ink-soft">العرض غير متوفر حالياً</p>
              )}
              <Link href="/offers" className="inline-flex h-11 items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline">
                شوف كل العروض
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="relative aspect-3/2 lg:me-6 lg:overflow-hidden lg:rounded-md">
            <FoodImage
              src={product.image}
              alt={product.imageAlt ?? product.name}
              fill
              sizes="(min-width: 1280px) 580px, (min-width: 1024px) 46vw, 100vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
