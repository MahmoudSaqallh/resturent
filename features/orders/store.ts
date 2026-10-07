import type { FulfillmentMethod, Order, OrderStatus } from "@/types";
import { restaurant } from "@/data/restaurant";
import { isRecord } from "@/lib/is-record";
import { createPersistentStore, useStore } from "@/lib/store";

const MAX_ORDERS = 20;

/** Fills fields that orders saved by older versions of the app do not have. */
function normalizeOrder(order: Order): Order {
  return {
    ...order,
    branchId: typeof order.branchId === "string" ? order.branchId : restaurant.branches[0].id,
    paymentStatus: order.paymentStatus === "paid" ? "paid" : "unpaid",
    lines: order.lines.map((line) => ({ ...line, selections: isRecord(line.selections) ? line.selections : {} })),
    totals: { ...order.totals, couponDiscount: order.totals.couponDiscount ?? 0 },
  };
}

function parseOrders(raw: unknown): Order[] | null {
  if (!Array.isArray(raw)) return null;
  // Orders are written by this app; a light shape check guards against tampering/old formats.
  return raw
    .filter(
      (order): order is Order =>
        isRecord(order) &&
        typeof order.id === "string" &&
        typeof order.number === "string" &&
        Array.isArray(order.lines) &&
        isRecord(order.totals)
    )
    .slice(0, MAX_ORDERS)
    .map(normalizeOrder);
}

export const ordersStore = createPersistentStore<Order[]>("jamra:orders:v1", [], parseOrders);

export function saveOrder(order: Order) {
  ordersStore.setState((orders) => [order, ...orders.filter((o) => o.id !== order.id)].slice(0, MAX_ORDERS));
}

export function useOrders() {
  return useStore(ordersStore, (orders) => orders);
}

export function useOrder(id: string) {
  return useStore(ordersStore, (orders) => orders.find((order) => order.id === id) ?? null);
}

/** Looks up an order saved on this device by its number ("JM-AB12CD" or "ab12cd"). */
export function findOrderByNumber(orders: Order[], input: string) {
  const wanted = input.trim().toUpperCase().replace(/^#/, "").replace(/^JM-?/, "");
  if (!wanted) return null;
  return orders.find((order) => order.number.toUpperCase().replace(/^JM-?/, "") === wanted) ?? null;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  received: "تم استلام الطلب",
  preparing: "جاري التحضير",
  ready: "جاهز",
  "out-for-delivery": "خرج للتوصيل",
  delivered: "تم التسليم",
};

export function statusSteps(fulfillment: FulfillmentMethod): { status: OrderStatus; label: string }[] {
  const steps: OrderStatus[] =
    fulfillment === "delivery"
      ? ["received", "preparing", "ready", "out-for-delivery", "delivered"]
      : ["received", "preparing", "ready", "delivered"];
  const labels: Partial<Record<OrderStatus, string>> =
    fulfillment === "pickup"
      ? { ready: "جاهز للاستلام", delivered: "تم الاستلام" }
      : fulfillment === "dine-in"
        ? { ready: "جاهز للتقديم", delivered: "تم التقديم" }
        : {};
  return steps.map((status) => ({ status, label: labels[status] ?? STATUS_LABELS[status] }));
}
