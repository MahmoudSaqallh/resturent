import type { DeliveryZone, RestaurantInfo } from "@/types";

/** Minimum for delivery: the zone's own, else the restaurant-wide one. */
export function deliveryMinimumFor(info: RestaurantInfo, zone?: DeliveryZone) {
  return zone?.minimumOrder ?? info.deliveryMinimum;
}

/** Fee after the free-delivery threshold and any free-delivery coupon. */
export function deliveryFeeFor(info: RestaurantInfo, zone: DeliveryZone, itemsTotal: number, freeDeliveryCoupon = false) {
  if (freeDeliveryCoupon) return 0;
  if (info.freeDeliveryOver !== undefined && itemsTotal >= info.freeDeliveryOver) return 0;
  return zone.fee;
}

/** How much more until free delivery, or null when not offered / already reached. */
export function freeDeliveryRemaining(info: RestaurantInfo, itemsTotal: number) {
  if (info.freeDeliveryOver === undefined || !info.fulfillment.delivery) return null;
  const remaining = info.freeDeliveryOver - itemsTotal;
  return remaining > 0 ? Math.round(remaining * 100) / 100 : 0;
}
