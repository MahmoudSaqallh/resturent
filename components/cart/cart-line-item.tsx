"use client";

import { useRef } from "react";
import { Pencil, Trash, TriangleAlert } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { setLineQuantity } from "@/features/cart/store";
import { removeWithUndo } from "@/features/cart/actions";
import type { ResolvedLine } from "@/features/cart/use-cart";
import { openProduct } from "@/features/ui/overlays";
import { DURATION, EASE, gsap, prefersReducedMotion } from "@/lib/motion";
import { AnimatedPrice } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { FoodImage } from "@/components/products/food-image";

export function CartLineItem({ line }: { line: ResolvedLine }) {
  const ref = useRef<HTMLLIElement>(null);
  const { item, product } = line;
  const editable = (product.options?.length ?? 0) > 0 || Boolean(item.note);

  const remove = () => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) {
      removeWithUndo(item.id, product.name);
      return;
    }
    // Short fade/slide, then collapse so the list closes the gap smoothly.
    gsap
      .timeline({ onComplete: () => removeWithUndo(item.id, product.name) })
      .to(el, { opacity: 0, x: -24, duration: DURATION.fast, ease: EASE.in })
      .to(el, { height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, duration: DURATION.fast, ease: EASE.inOut });
  };

  return (
    <li ref={ref} className="flex gap-3 overflow-hidden py-4">
      <FoodImage
        src={product.image}
        alt={product.imageAlt ?? product.name}
        sizes="80px"
        className="size-20 shrink-0 rounded-md"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm leading-snug font-bold">{product.name}</h3>
          <AnimatedPrice amount={line.total} className="text-base font-bold" />
        </div>
        {line.options.length > 0 && (
          <ul className="mt-1 flex flex-col text-xs leading-relaxed text-ink-muted">
            {line.options.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ul>
        )}
        {item.note && <p className="mt-1 text-xs text-ink-soft">ملاحظة: {item.note}</p>}
        {item.quantity > 1 && (
          <p className="tabular mt-1 text-xs text-ink-muted">{formatPrice(line.unitPrice)} للواحدة</p>
        )}
        {line.unavailable && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-danger">
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            غير متوفر حالياً — احذفه للمتابعة
          </p>
        )}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            onChange={(quantity) => setLineQuantity(item.id, quantity)}
            onRemove={remove}
            itemLabel={product.name}
          />
          <div className="flex items-center">
            {editable && !line.unavailable && (
              <button
                type="button"
                onClick={() => openProduct(product.id, item.id)}
                aria-label={`تعديل ${product.name}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-ink/6 hover:text-ink"
              >
                <Pencil className="size-4" aria-hidden="true" />
                تعديل
              </button>
            )}
            <button
              type="button"
              onClick={remove}
              aria-label={`حذف ${product.name} من السلة`}
              className="inline-flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-danger-tint hover:text-danger"
            >
              <Trash className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
