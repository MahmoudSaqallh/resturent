"use client";

import type { ReactNode } from "react";
import { Bike, Store, UtensilsCrossed } from "lucide-react";
import type { FulfillmentMethod } from "@/types";
import { cn } from "@/lib/cn";
import { availableFulfillments, FULFILLMENT_LABELS, setFulfillment, useOrdering } from "@/features/ordering/store";

const ICONS: Record<FulfillmentMethod, ReactNode> = {
  delivery: <Bike className="size-4" aria-hidden="true" />,
  pickup: <Store className="size-4" aria-hidden="true" />,
  "dine-in": <UtensilsCrossed className="size-4" aria-hidden="true" />,
};

/**
 * Compact segmented control for the order type. Dine-in appears only after
 * a table QR code was scanned; with a single method the control is hidden.
 */
export function OrderTypeSelector({ className, name = "order-type" }: { className?: string; name?: string }) {
  const { fulfillment, table } = useOrdering();
  const methods = availableFulfillments(table);
  if (methods.length < 2) return null;

  return (
    <div
      role="radiogroup"
      aria-label="نوع الطلب"
      className={cn("grid gap-1 rounded-full bg-cream-deep p-1", className)}
      style={{ gridTemplateColumns: `repeat(${methods.length}, minmax(0, 1fr))` }}
    >
      {methods.map((method) => {
        const checked = method === fulfillment;
        return (
          <label
            key={method}
            className={cn(
              "flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 text-sm font-semibold whitespace-nowrap transition-colors duration-150",
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-brand",
              checked ? "bg-surface text-ink shadow-sm" : "text-ink-soft hover:text-ink"
            )}
          >
            <input
              type="radio"
              name={name}
              value={method}
              checked={checked}
              onChange={() => setFulfillment(method)}
              className="sr-only"
            />
            {ICONS[method]}
            {FULFILLMENT_LABELS[method]}
            {method === "dine-in" && table && <span className="tabular text-xs text-ink-muted">· {table}</span>}
          </label>
        );
      })}
    </div>
  );
}
