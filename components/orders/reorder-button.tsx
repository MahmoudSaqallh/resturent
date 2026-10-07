"use client";

import { useState } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";
import type { Order } from "@/types";
import { cn } from "@/lib/cn";
import { useCatalog } from "@/features/menu/catalog";
import { applyPlan, planOrder, type ReorderPlan } from "@/features/orders/reorder";
import { openCart } from "@/features/ui/overlays";
import { showToast } from "@/features/toasts/store";
import { buttonClasses } from "@/components/ui/button";

/**
 * "اطلبها مرة ثانية": re-adds a past order at today's prices. When anything
 * changed (unavailable items, removed options, new prices) the customer sees
 * the list first and decides; nothing is added behind their back.
 */
export function ReorderButton({ order, className, label = "اطلبها مرة ثانية" }: { order: Order; className?: string; label?: string }) {
  const { productsById, complete, status, ensureComplete } = useCatalog();
  const [plan, setPlan] = useState<ReorderPlan | null>(null);
  const loading = !complete && status !== "error";

  const add = (next: ReorderPlan) => {
    const added = applyPlan(next);
    setPlan(null);
    if (added > 0) {
      showToast("أُضيف طلبك للسلة");
      openCart();
    }
  };

  const onClick = () => {
    if (!complete) {
      ensureComplete();
      return;
    }
    const next = planOrder(order, productsById);
    if (next.warnings.length === 0) add(next);
    else setPlan(next);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        aria-expanded={plan ? true : undefined}
        className={buttonClasses({ variant: "outline", size: "md", className: "rounded-full" })}
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        {loading ? "جارٍ تجهيز المنيو…" : label}
      </button>
      {plan && (
        <div
          role="alert"
          className={cn("mt-3 rounded-lg p-3.5 text-sm", plan.lines.length > 0 ? "bg-mustard-tint text-ink" : "bg-danger-tint text-danger")}
        >
          <p className="flex items-center gap-2 font-semibold">
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            {plan.lines.length > 0 ? "بعض الأشياء تغيّرت منذ طلبك:" : "لا يمكن إعادة هذا الطلب حالياً:"}
          </p>
          <ul className="mt-1.5 list-disc ps-6">
            {plan.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.lines.length > 0 && (
              <button type="button" onClick={() => add(plan)} className={buttonClasses({ size: "sm" })}>
                أضف المتوفر للسلة
              </button>
            )}
            <button type="button" onClick={() => setPlan(null)} className={buttonClasses({ variant: "ghost", size: "sm" })}>
              {plan.lines.length > 0 ? "إلغاء" : "حسناً"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
