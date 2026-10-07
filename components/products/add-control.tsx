"use client";

import { useMemo, useRef } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import type { Product, Selections } from "@/types";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { cartStore, setLineQuantity } from "@/features/cart/store";
import { lineKey, needsConfiguration, withDefaults } from "@/features/cart/pricing";
import { quickAdd, removeWithUndo } from "@/features/cart/actions";
import { useProductQuantity } from "@/features/cart/use-cart";
import { openProduct } from "@/features/ui/overlays";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

interface AddControlProps {
  product: Product;
  /** Preselected options (e.g. a size picked on a drink card) that make quick add possible. */
  preset?: Selections;
  /** "dark" when placed on an ink background. */
  tone?: "default" | "dark";
  className?: string;
}

const control =
  "relative z-10 inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold whitespace-nowrap transition-[background-color,transform] duration-150 active:scale-95";

/**
 * Card-level add action:
 * - no required choices → "+ إضافة", then a quantity stepper for that line
 * - required choices → "اختر" opens the details sheet
 * - unavailable → disabled
 */
export function AddControl({ product, preset, tone = "default", className }: AddControlProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const configurable = needsConfiguration(product) && !preset;
  const quickSelections = useMemo(() => withDefaults(product, preset), [product, preset]);
  const quickKey = lineKey(product.id, quickSelections);
  const quickLine = useStore(
    cartStore,
    (state) => state.items.find((item) => lineKey(item.productId, item.selections, item.note) === quickKey) ?? null
  );
  const inCart = useProductQuantity(product.id);

  if (!product.available) {
    return (
      <button type="button" disabled className={cn(control, "bg-cream-deep text-ink-muted", className)}>
        غير متوفر
      </button>
    );
  }

  if (configurable) {
    return (
      <div className={cn("relative z-10 flex items-center gap-2", className)}>
        {inCart > 0 && (
          <span className={cn("tabular text-xs font-semibold", tone === "dark" ? "text-white/70" : "text-ink-muted")}>
            <span className="sr-only">في السلة: </span>×{inCart}
          </span>
        )}
        <button
          type="button"
          onClick={() => openProduct(product.id)}
          aria-label={`اختر خيارات ${product.name}`}
          className={cn(
            control,
            tone === "dark" ? "bg-cream text-ink hover:bg-white" : "bg-ink text-cream hover:bg-ink-soft"
          )}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          اختر
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={cn("relative z-10", className)}>
      {quickLine ? (
        <QuantityStepper
          size="sm"
          tone="brand"
          value={quickLine.quantity}
          itemLabel={product.name}
          onChange={(quantity) => setLineQuantity(quickLine.id, quantity)}
          onRemove={() => removeWithUndo(quickLine.id, product.name)}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!quickAdd(product, preset)) return;
            // Keep keyboard focus on the control that replaced this button.
            requestAnimationFrame(() => wrapRef.current?.querySelector("button")?.focus());
          }}
          aria-label={`إضافة ${product.name} إلى السلة`}
          className={cn(control, "bg-brand text-white hover:bg-brand-hover")}
        >
          <Plus className="size-4" strokeWidth={2.75} aria-hidden="true" />
          إضافة
        </button>
      )}
    </div>
  );
}
