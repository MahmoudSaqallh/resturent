"use client";

import { useMemo, useSyncExternalStore } from "react";
import { CircleAlert, Link2Off, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { decodeCart } from "@/features/cart/share";
import { describeSelections, getUnitPrice, sanitizeSelections } from "@/features/cart/pricing";
import { useCatalog } from "@/features/menu/catalog";
import { applyPlan, planReorder } from "@/features/orders/reorder";
import { openCart } from "@/features/ui/overlays";
import { showToast } from "@/features/toasts/store";
import { useGoToMenu } from "@/features/menu/use-go-to-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FoodImage } from "@/components/products/food-image";

const subscribe = (listener: () => void) => {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
};

/** A cart someone shared by link: review it, then add it to your own cart. */
export function SharedCartView() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => null);
  const { productsById } = useCatalog();
  const goToMenu = useGoToMenu();
  const lines = useMemo(() => (hash === null ? undefined : decodeCart(hash)), [hash]);

  const plan = useMemo(() => {
    if (!lines) return null;
    return planReorder(
      lines.map((line) => ({ ...line, name: productsById.get(line.productId)?.name ?? "صنف لم يعد في المنيو" })),
      productsById
    );
  }, [lines, productsById]);

  if (lines === undefined) {
    return <div className="container-page py-12" aria-busy="true" />;
  }
  if (!lines || !plan) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<Link2Off className="size-7" />}
          title="الرابط غير صالح"
          description="ربما انقطع جزء من الرابط عند نسخه. اطلب من صاحب السلة إرساله مرة ثانية."
          action={<Button onClick={() => goToMenu()}>شوف المنيو</Button>}
        />
      </div>
    );
  }

  const total = plan.lines.reduce((sum, line) => {
    const product = productsById.get(line.productId);
    return product ? sum + getUnitPrice(product, line.selections) * line.quantity : sum;
  }, 0);

  return (
    <div className="container-page max-w-2xl py-8 md:py-12">
      <h1 className="text-2xl font-extrabold md:text-3xl">سلة مشتركة معك</h1>
      <p className="mt-2 text-ink-soft">راجع الأصناف ثم أضفها لسلتك. الأسعار محسوبة من المنيو الحالي.</p>

      <ul className="mt-6 divide-y divide-line rounded-lg bg-surface px-4 ring-1 ring-line">
        {lines.map((line, index) => {
          const product = productsById.get(line.productId);
          const selections = product ? sanitizeSelections(product, line.selections) : {};
          return (
            <li key={`${line.productId}-${index}`} className="flex gap-3 py-3">
              {product && <FoodImage src={product.image} alt="" sizes="56px" className="size-14 shrink-0 rounded-md" />}
              <div className="min-w-0 flex-1 text-sm">
                <p className="flex justify-between gap-2 font-bold">
                  <span>
                    <span className="tabular text-ink-muted">{line.quantity}×</span> {product?.name ?? "صنف لم يعد في المنيو"}
                  </span>
                  {product?.available && (
                    <span className="tabular shrink-0">{formatPrice(getUnitPrice(product, selections) * line.quantity)}</span>
                  )}
                </p>
                {product && describeSelections(product, selections).length > 0 && (
                  <p className="mt-0.5 text-xs text-ink-muted">{describeSelections(product, selections).join(" · ")}</p>
                )}
                {line.note && <p className="mt-0.5 text-xs text-ink-soft">ملاحظة: {line.note}</p>}
              </div>
            </li>
          );
        })}
      </ul>

      {plan.warnings.length > 0 && (
        <div role="status" className="mt-4 rounded-lg bg-mustard-tint p-3.5 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            بعض الأشياء تغيّرت:
          </p>
          <ul className="mt-1.5 list-disc ps-6">
            {plan.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {plan.lines.length > 0 && (
          <p className="text-sm text-ink-muted">
            المجموع الحالي <span className="tabular text-lg font-extrabold text-ink">{formatPrice(total)}</span>
          </p>
        )}
        <Button
          size="lg"
          disabled={plan.lines.length === 0}
          onClick={() => {
            applyPlan(plan);
            showToast("أُضيفت الأصناف لسلتك");
            openCart();
          }}
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          {plan.warnings.length > 0 ? "أضف المتوفر لسلتي" : "أضف كل الأصناف لسلتي"}
        </Button>
      </div>
    </div>
  );
}
