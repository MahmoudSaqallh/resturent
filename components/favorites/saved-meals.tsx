"use client";

import { useState } from "react";
import { Bookmark, CircleAlert, Plus, Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { describeSelections, getUnitPrice, sanitizeSelections } from "@/features/cart/pricing";
import { useCatalog } from "@/features/menu/catalog";
import { applyPlan, planReorder } from "@/features/orders/reorder";
import { removeMeal, type SavedMeal } from "@/features/saved-meals/store";
import { notifyAdded } from "@/features/cart/actions";
import { FoodImage } from "@/components/products/food-image";

/** One saved configuration, priced and checked against today's menu. */
export function SavedMealRow({ meal, product, compact }: { meal: SavedMeal; product?: Product; compact?: boolean }) {
  const { productsById } = useCatalog();
  const [confirming, setConfirming] = useState(false);
  const plan = planReorder([{ ...meal, name: product?.name ?? meal.name, quantity: 1 }], productsById);
  const selections = product ? sanitizeSelections(product, meal.selections) : meal.selections;
  const options = product ? describeSelections(product, selections) : [];
  const canAdd = plan.lines.length > 0;

  return (
    <li className="flex gap-3 py-3">
      {product && <FoodImage src={product.image} alt="" sizes="64px" className="size-16 shrink-0 rounded-md" />}
      <div className="min-w-0 flex-1">
        <p className="flex items-start justify-between gap-3">
          <span className="font-bold">{meal.name}</span>
          {product && canAdd && <span className="tabular shrink-0 font-bold">{formatPrice(getUnitPrice(product, selections))}</span>}
        </p>
        {options.length > 0 && <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{options.join(" · ")}</p>}
        {meal.note && <p className="mt-0.5 text-xs text-ink-soft">ملاحظة: {meal.note}</p>}
        {plan.warnings.length > 0 && (
          <p className="mt-1 flex items-start gap-1.5 text-xs font-semibold text-danger">
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {plan.warnings[0]}
          </p>
        )}

        <div className={cn("mt-2 flex flex-wrap items-center gap-2", compact && "mt-1.5")}>
          {canAdd && (
            <button
              type="button"
              onClick={() => {
                applyPlan(plan);
                notifyAdded(meal.name);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-bold text-cream transition-colors hover:bg-brand"
            >
              <Plus className="size-4" aria-hidden="true" />
              أضف للسلة
            </button>
          )}
          {!compact &&
            (confirming ? (
              <span className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => removeMeal(meal.id)}
                  className="h-9 rounded-full bg-danger px-3 font-bold text-white"
                >
                  احذف «{meal.name}»
                </button>
                <button type="button" onClick={() => setConfirming(false)} className="h-9 px-2 font-semibold text-ink-soft">
                  إلغاء
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label={`حذف ${meal.name} من وجباتي المفضلة`}
                className="inline-flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-ink/6 hover:text-danger"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            ))}
        </div>
      </div>
    </li>
  );
}

export function SavedMealsList({ meals }: { meals: SavedMeal[] }) {
  const { productsById } = useCatalog();
  return (
    <section aria-labelledby="saved-meals-title">
      <h2 id="saved-meals-title" className="flex items-center gap-2 text-xl font-extrabold">
        <Bookmark className="size-5 text-brand" aria-hidden="true" />
        وجباتي المفضلة
      </h2>
      <p className="mt-1 text-sm text-ink-muted">وجبات حفظتها بخياراتك، تنضاف للسلة بضغطة وبأسعار اليوم.</p>
      <ul className="mt-3 divide-y divide-line rounded-lg bg-surface px-4 ring-1 ring-line">
        {meals.map((meal) => (
          <SavedMealRow key={meal.id} meal={meal} product={productsById.get(meal.productId)} />
        ))}
      </ul>
    </section>
  );
}
