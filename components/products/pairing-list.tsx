"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useCatalog } from "@/features/menu/catalog";
import { getStartingPrice, needsConfiguration } from "@/features/cart/pricing";
import { quickAdd } from "@/features/cart/actions";
import { openProduct } from "@/features/ui/overlays";
import { FoodImage } from "./food-image";

/** Compact suggestion row with a one-tap add (or "choose" when options are required). */
export function SuggestionRow({ product }: { product: Product }) {
  const { amount, isFrom } = getStartingPrice(product);
  const configurable = needsConfiguration(product);
  return (
    <li className="flex items-center gap-3 rounded-md bg-surface p-2 ring-1 ring-line">
      <FoodImage src={product.image} alt="" sizes="56px" className="size-14 shrink-0 rounded-sm" />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => openProduct(product.id)}
          className="block max-w-full truncate text-start text-sm font-bold hover:underline"
        >
          {product.name}
        </button>
        <p className="tabular text-sm text-ink-muted">
          {isFrom && "ابتداءً من "}
          {formatPrice(amount)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => (configurable ? openProduct(product.id) : quickAdd(product))}
        aria-label={configurable ? `اختر خيارات ${product.name}` : `إضافة ${product.name} إلى السلة`}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-cream transition-[background-color,transform] duration-150 hover:bg-brand active:scale-90"
      >
        {configurable ? (
          <SlidersHorizontal className="size-4" aria-hidden="true" />
        ) : (
          <Plus className="size-5" strokeWidth={2.5} aria-hidden="true" />
        )}
      </button>
    </li>
  );
}

/** "يُطلب معها غالباً": 2–3 curated complements from the product's pairing data. */
export function PairingList({ product, className }: { product: Product; className?: string }) {
  const { productsById } = useCatalog();
  const pairs = (product.pairsWith ?? [])
    .map((id) => productsById.get(id))
    .filter((p): p is Product => Boolean(p && p.available && !p.hidden))
    .slice(0, 3);
  if (pairs.length === 0) return null;

  return (
    <section aria-labelledby={`${product.id}-pairs`} className={cn("border-t border-line pt-5", className)}>
      <h3 id={`${product.id}-pairs`} className="text-base font-bold">
        يُطلب معها غالباً
      </h3>
      <ul className="mt-3 flex flex-col gap-2">
        {pairs.map((pair) => (
          <SuggestionRow key={pair.id} product={pair} />
        ))}
      </ul>
    </section>
  );
}
