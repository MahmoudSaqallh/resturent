"use client";

import { useEffect, useMemo } from "react";
import { Plus, Zap } from "lucide-react";
import type { Order, Product } from "@/types";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/cn";
import { formatDateTime, formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/store";
import { useCatalog } from "@/features/menu/catalog";
import { useOrders } from "@/features/orders/store";
import { useSavedMeals } from "@/features/saved-meals/store";
import { needsConfiguration } from "@/features/cart/pricing";
import { quickAdd } from "@/features/cart/actions";
import { openProduct } from "@/features/ui/overlays";
import { SavedMealRow } from "@/components/favorites/saved-meals";
import { ReorderButton } from "./reorder-button";

/** Products this device ordered most (real local history only): by order count, then quantity. */
function mostOrdered(orders: Order[], productsById: Map<string, Product>) {
  const stats = new Map<string, { orders: number; quantity: number }>();
  for (const order of orders) {
    const seen = new Set<string>();
    for (const line of order.lines) {
      const entry = stats.get(line.productId) ?? { orders: 0, quantity: 0 };
      entry.quantity += line.quantity;
      if (!seen.has(line.productId)) entry.orders += 1;
      seen.add(line.productId);
      stats.set(line.productId, entry);
    }
  }
  return [...stats.entries()]
    .map(([id, stat]) => ({ product: productsById.get(id), ...stat }))
    .filter((entry): entry is { product: Product; orders: number; quantity: number } =>
      Boolean(entry.product?.available && !entry.product.hidden)
    )
    .sort((a, b) => b.orders - a.orders || b.quantity - a.quantity)
    .slice(0, 3);
}

/**
 * "اطلب بسرعة" for returning customers: last order, their most ordered
 * items and a saved meal. Built only from what this device actually has;
 * renders nothing for a first visit.
 */
export function QuickOrder({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const orders = useOrders();
  const meals = useSavedMeals();
  const { productsById, complete, ensureComplete } = useCatalog();
  const hasHistory = hydrated && (orders.length > 0 || meals.length > 0);

  // Pricing these needs the full menu; fetch it only for customers who have history.
  useEffect(() => {
    if (hasHistory && !complete) ensureComplete();
  }, [hasHistory, complete, ensureComplete]);

  const top = useMemo(() => (complete ? mostOrdered(orders, productsById) : []), [complete, orders, productsById]);
  if (!hasHistory || !complete) return null;

  const last = orders[0];
  const meal = meals[0];
  const blocks = [last, top.length > 0, meal].filter(Boolean).length;
  const col = "flex flex-col gap-3 p-4 md:p-5";

  return (
    <section aria-labelledby="quick-order-title" className={cn("container-page", className)}>
      <h2 id="quick-order-title" className="flex items-center gap-2 text-xl font-extrabold md:text-2xl">
        <Zap className="size-5 text-brand" aria-hidden="true" />
        اطلب بسرعة
      </h2>
      <div
        className={cn(
          "mt-4 grid divide-y divide-line rounded-lg bg-surface ring-1 ring-line md:divide-x md:divide-y-0",
          blocks === 3 ? "md:grid-cols-3" : blocks === 2 ? "md:grid-cols-2" : ""
        )}
      >
        {last && (
          <div className={col}>
            <h3 className="text-sm font-bold text-ink-muted">آخر طلب</h3>
            <div>
              <p className="line-clamp-2 font-semibold">
                {last.lines.map((line) => `${line.quantity}× ${line.name}`).join("، ")}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {formatDateTime(last.createdAt, restaurant.timeZone)} · كان مجموعه {formatPrice(last.totals.total)}
              </p>
            </div>
            <ReorderButton order={last} label="اطلب بسرعة" className="mt-auto" />
          </div>
        )}

        {top.length > 0 && (
          <div className={col}>
            <h3 className="text-sm font-bold text-ink-muted">الأكثر طلباً منك</h3>
            <ul className="flex flex-col gap-2">
              {top.map(({ product, orders: times }) => (
                <li key={product.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{product.name}</span>
                    {times > 1 && <span className="text-xs text-ink-muted">في {times} من طلباتك</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => (needsConfiguration(product) ? openProduct(product.id) : quickAdd(product))}
                    aria-label={needsConfiguration(product) ? `اختر خيارات ${product.name}` : `إضافة ${product.name} إلى السلة`}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-cream transition-colors hover:bg-brand"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {meal && (
          <div className={col}>
            <h3 className="text-sm font-bold text-ink-muted">وجبتك المفضلة</h3>
            <ul className="-my-3">
              <SavedMealRow meal={meal} product={productsById.get(meal.productId)} compact />
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
