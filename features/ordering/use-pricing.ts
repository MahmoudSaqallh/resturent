"use client";

import { useMemo } from "react";
import { restaurant } from "@/data/restaurant";
import { useCartSummary } from "@/features/cart/use-cart";
import { deliveryFeeFor, deliveryMinimumFor, freeDeliveryRemaining } from "@/features/cart/delivery";
import { useCouponPreview } from "@/features/coupons/use-coupon";
import { useOrdering } from "./store";

/**
 * The cart priced for the current order type, area and promo code — the
 * same rules the order API applies, so the customer sees no surprises.
 * The server still re-computes everything.
 */
export function useOrderPricing() {
  const summary = useCartSummary();
  const session = useOrdering();
  const delivery = session.fulfillment === "delivery";
  const zone = delivery ? restaurant.deliveryZones.find((z) => z.id === session.zoneId) : undefined;
  const couponItems = useMemo(
    () =>
      summary.lines
        .filter((line) => !line.unavailable)
        .map(({ item }) => ({ productId: item.productId, quantity: item.quantity, selections: item.selections })),
    [summary.lines]
  );
  const coupon = useCouponPreview(couponItems.length > 0 ? session.couponCode : null, couponItems);

  return useMemo(() => {
    const couponDiscount = coupon.status === "valid" ? coupon.discount : 0;
    const freeDeliveryCoupon = coupon.status === "valid" && coupon.freeDelivery;
    /** undefined = not a delivery order; null = area not chosen yet. */
    const deliveryFee = delivery
      ? zone
        ? deliveryFeeFor(restaurant, zone, summary.itemsTotal, freeDeliveryCoupon)
        : null
      : undefined;
    const minimum = delivery ? deliveryMinimumFor(restaurant, zone) : undefined;
    const belowMinimum = minimum !== undefined && summary.itemsTotal < minimum;
    const freeRemaining = delivery && !freeDeliveryCoupon ? freeDeliveryRemaining(restaurant, summary.itemsTotal) : null;
    const total = Math.max(0, Math.round((summary.itemsTotal - couponDiscount + (deliveryFee ?? 0)) * 100) / 100);
    return {
      summary,
      session,
      zone,
      coupon,
      couponDiscount,
      deliveryFee,
      minimum,
      belowMinimum,
      freeRemaining,
      total,
      /** Send the code only when the preview accepted it. */
      couponToSend: coupon.status === "valid" ? coupon.code : undefined,
    };
  }, [summary, session, zone, coupon, delivery]);
}
