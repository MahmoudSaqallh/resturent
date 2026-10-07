"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Clock, ShoppingBag } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { formatPrice, ITEM_FORMS, pluralize } from "@/lib/format";
import { useHydrated } from "@/lib/store";
import { useCatalog } from "@/features/menu/catalog";
import { useOrderPricing } from "@/features/ordering/use-pricing";
import { getCartSuggestions } from "@/features/cart/suggestions";
import { useDelayedFlag } from "@/lib/use-delayed-flag";
import { dismissRemoved, undoRemove, useRemovedLine } from "@/features/cart/undo";
import { closeCart, useOverlay } from "@/features/ui/overlays";
import { useGoToMenu } from "@/features/menu/use-go-to-menu";
import { describeBlock, useOrderingState } from "@/features/restaurant/use-status";
import { OrderTypeSelector } from "@/components/ordering/order-type-selector";
import { whatsappLink, WhatsAppIcon } from "@/components/ui/brand";
import { Sheet, SheetHeader } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses, Button } from "@/components/ui/button";
import { SuggestionRow } from "@/components/products/pairing-list";
import { ShareMenu } from "@/components/ui/share-menu";
import { sharedCartPath } from "@/features/cart/share";
import { CartLineItem } from "./cart-line-item";
import { CartSummary, FreeDeliveryProgress } from "./cart-summary";

const TITLE_ID = "cart-title";

export function CartDrawer() {
  const open = useOverlay("cartOpen");
  const hydrated = useHydrated();
  const pricing = useOrderPricing();
  const { summary } = pricing;
  const { productsById, status: catalogStatus, ensureComplete } = useCatalog();
  const ordering = useOrderingState(pricing.session.branchId);
  const goToMenu = useGoToMenu();

  const suggestions = useMemo(
    () => getCartSuggestions(summary.lines.map((line) => line.product), productsById),
    [summary.lines, productsById]
  );
  const showSkeleton = useDelayedFlag(summary.pending);
  const removed = useRemovedLine();
  const undoRef = useRef<HTMLButtonElement>(null);

  // Inline undo: focus it so keyboard users can act, auto-hide after a few seconds.
  useEffect(() => {
    if (!removed) return;
    undoRef.current?.focus({ preventScroll: true });
    const timer = setTimeout(dismissRemoved, 6000);
    return () => clearTimeout(timer);
  }, [removed]);
  useEffect(() => {
    if (!open) dismissRemoved();
  }, [open]);

  const hasUnavailable = summary.lines.some((line) => line.unavailable);
  const empty = hydrated && !summary.pending && summary.lines.length === 0;
  const delivery = pricing.session.fulfillment === "delivery";

  return (
    <Sheet open={open} onClose={closeCart} variant="drawer" labelledBy={TITLE_ID}>
      <SheetHeader
        titleId={TITLE_ID}
        onClose={closeCart}
        title={
          <>
            سلتك
            {summary.itemCount > 0 && (
              <span className="ms-2 text-sm font-medium text-ink-muted">({pluralize(summary.itemCount, ITEM_FORMS)})</span>
            )}
          </>
        }
      />

      {removed && (
        <div
          role="status"
          className="mx-4 mt-3 flex shrink-0 items-center justify-between gap-3 rounded-md bg-ink py-1.5 ps-3.5 pe-1.5 text-sm text-cream md:mx-5"
        >
          <span className="min-w-0 truncate">تمت إزالة {removed.name}</span>
          <button
            ref={undoRef}
            type="button"
            onClick={undoRemove}
            className="h-9 shrink-0 rounded-md px-3 font-bold text-mustard transition-colors hover:bg-white/10"
          >
            تراجع
          </button>
        </div>
      )}

      {summary.pending ? (
        // The page started with a partial catalog; prices for saved items are loading.
        catalogStatus === "error" ? (
          <div className="flex flex-1 flex-col justify-center px-6">
            <EmptyState
              compact
              title="تعذّر تحميل أسعار سلتك"
              description="تأكد من اتصالك بالإنترنت. سلتك محفوظة على جهازك."
              action={
                <Button variant="outline" onClick={ensureComplete}>
                  حاول مرة أخرى
                </Button>
              }
            />
          </div>
        ) : !showSkeleton ? (
          <div className="flex-1" aria-busy="true" />
        ) : (
          <div className="flex flex-col gap-4 px-4 py-5 md:px-5" aria-busy="true" aria-label="جارٍ تحميل السلة">
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="skeleton size-20 shrink-0 rounded-md" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="skeleton h-4 w-2/3 rounded-sm" />
                  <div className="skeleton h-3 w-1/2 rounded-sm" />
                  <div className="skeleton mt-auto h-9 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : empty ? (
        <div className="flex flex-1 flex-col justify-center px-6">
          <EmptyState
            icon={<ShoppingBag className="size-7" />}
            title="سلتك لسه فاضية 🍔"
            description="اختار وجبتك المفضلة وابدأ الطلب."
            action={
              <Button variant="primary" size="lg" onClick={() => goToMenu()}>
                استعرض المنيو
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 md:px-5">
            <ul className="divide-y divide-line">
              {summary.lines.map((line) => (
                <CartLineItem key={line.item.id} line={line} />
              ))}
            </ul>

            {/* Families and friends: send the cart as a link (prices are rechecked on open). */}
            <ShareMenu
              url={sharedCartPath(summary.lines.map((line) => line.item))}
              title={`سلة من ${restaurant.name}`}
              text="هاي سلتي، شوفها وأضف عليها:"
              label="شارك السلة"
              showLabel
              className="-mt-1 mb-2"
            />

            {suggestions.length > 0 && (
              <section aria-labelledby="cart-suggestions" className="border-t border-line pt-4 pb-5">
                <h3 id="cart-suggestions" className="text-sm font-bold">
                  أضف مع طلبك
                </h3>
                <ul className="mt-2.5 flex flex-col gap-2">
                  {suggestions.map((product) => (
                    <SuggestionRow key={product.id} product={product} />
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="shrink-0 border-t border-line bg-surface px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-5">
            {ordering && !ordering.canOrderNow && (
              <p className="mb-3 flex items-center gap-2 rounded-md bg-mustard-tint px-3 py-2 text-sm font-medium text-ink">
                <Clock className="size-4 shrink-0" aria-hidden="true" />
                {describeBlock(ordering)}
                {ordering.canSchedule && " يمكنك جدولة طلبك."}
              </p>
            )}
            <OrderTypeSelector name="cart-order-type" className="mb-3" />
            {delivery && (
              <FreeDeliveryProgress
                remaining={pricing.freeRemaining}
                threshold={restaurant.freeDeliveryOver}
                className="mb-3"
              />
            )}
            <CartSummary
              subtotal={summary.subtotal}
              discount={summary.discount}
              couponDiscount={pricing.couponDiscount}
              couponCode={pricing.couponToSend}
              deliveryFee={pricing.deliveryFee}
              total={pricing.total}
              deliveryNote={
                delivery
                  ? [
                      pricing.deliveryFee === null ? "رسوم التوصيل حسب المنطقة وتظهر عند إتمام الطلب." : "",
                      pricing.belowMinimum && pricing.minimum !== undefined
                        ? `الحد الأدنى لطلبات التوصيل ${formatPrice(pricing.minimum)}، أضف ${formatPrice(pricing.minimum - summary.itemsTotal)}.`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined
                  : undefined
              }
            />
            {hasUnavailable ? (
              <p role="alert" className="mt-3 text-sm font-semibold text-danger">
                احذف الأصناف غير المتوفرة لإتمام الطلب.
              </p>
            ) : null}
            <Link
              href="/checkout"
              onClick={(event) => {
                if (hasUnavailable || !hydrated) {
                  event.preventDefault();
                  return;
                }
                closeCart();
              }}
              aria-disabled={hasUnavailable || !hydrated}
              className={buttonClasses({
                variant: "primary",
                size: "xl",
                className: `mt-4 w-full rounded-full ${hasUnavailable ? "pointer-events-none opacity-45" : ""}`,
              })}
            >
              إتمام الطلب
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
            <a
              href={whatsappLink(
                [
                  "مرحباً، أريد أن أطلب:",
                  ...summary.lines.map(
                    (line) =>
                      `• ${line.quantity}× ${line.product.name}${line.options.length ? ` (${line.options.join("، ")})` : ""}`
                  ),
                  `المجموع حسب الموقع: ${formatPrice(pricing.total)}`,
                ].join("\n")
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex h-11 items-center justify-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
            >
              <WhatsAppIcon size={18} />
              أو أرسل طلبك عبر واتساب
            </a>
          </div>
        </>
      )}
    </Sheet>
  );
}
