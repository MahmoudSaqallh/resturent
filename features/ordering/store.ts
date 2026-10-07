"use client";

import type { FulfillmentMethod } from "@/types";
import { restaurant } from "@/data/restaurant";
import { isRecord } from "@/lib/is-record";
import { createPersistentStore, useStore } from "@/lib/store";

/**
 * How this visit is ordering: order type, branch, table (from a QR code),
 * delivery area, timing and an entered promo code. Kept in session storage:
 * a new visit starts fresh, and a table number never outlives the meal.
 */
export interface OrderingSession {
  fulfillment: FulfillmentMethod;
  branchId: string;
  /** Set only by a table QR code; dine-in is offered only with a table. */
  table: string | null;
  zoneId: string;
  /** null = as soon as possible, else an ISO slot from getScheduleSlots. */
  scheduledFor: string | null;
  couponCode: string | null;
}

const FULFILLMENTS: FulfillmentMethod[] = ["delivery", "pickup", "dine-in"];
const TABLE_PATTERN = /^[A-Za-z0-9-]{1,10}$/;

function defaultFulfillment(): FulfillmentMethod {
  return restaurant.fulfillment.delivery ? "delivery" : "pickup";
}

const INITIAL: OrderingSession = {
  fulfillment: defaultFulfillment(),
  branchId: restaurant.branches[0].id,
  table: null,
  zoneId: "",
  scheduledFor: null,
  couponCode: null,
};

const str = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");

function parseSession(raw: unknown): OrderingSession | null {
  if (!isRecord(raw)) return null;
  const table = typeof raw.table === "string" && TABLE_PATTERN.test(raw.table) ? raw.table : null;
  let fulfillment = FULFILLMENTS.find((f) => f === raw.fulfillment && restaurant.fulfillment[f]) ?? INITIAL.fulfillment;
  if (fulfillment === "dine-in" && !table) fulfillment = INITIAL.fulfillment;
  const branchId = restaurant.branches.some((b) => b.id === raw.branchId) ? String(raw.branchId) : INITIAL.branchId;
  const zoneId = restaurant.deliveryZones.some((z) => z.id === raw.zoneId) ? String(raw.zoneId) : "";
  const scheduled = str(raw.scheduledFor, 40);
  return {
    fulfillment,
    branchId,
    table,
    zoneId,
    scheduledFor: scheduled && Number.isFinite(Date.parse(scheduled)) ? scheduled : null,
    couponCode: str(raw.couponCode, 32) || null,
  };
}

export const orderingStore = createPersistentStore<OrderingSession>(
  "jamra:ordering:v1",
  INITIAL,
  parseSession,
  "session"
);

export function useOrdering() {
  return useStore(orderingStore, (state) => state);
}

export function setOrdering(patch: Partial<OrderingSession>) {
  orderingStore.setState((state) => ({ ...state, ...patch }));
}

export function setFulfillment(fulfillment: FulfillmentMethod) {
  if (!restaurant.fulfillment[fulfillment]) return;
  orderingStore.setState((state) => {
    if (fulfillment === "dine-in" && !state.table) return state;
    // Dine-in orders are always "now": the guest is at the table.
    return { ...state, fulfillment, scheduledFor: fulfillment === "dine-in" ? null : state.scheduledFor };
  });
}

/**
 * From a table QR code (`?table=12`, optionally `&branch=main`, or /t/{branch}/{table}).
 * Returns the accepted table or null.
 */
export function applyTableFromQr(raw: string | null, rawBranch?: string | null) {
  const table = raw?.trim() ?? "";
  if (!restaurant.fulfillment["dine-in"] || !TABLE_PATTERN.test(table)) return null;
  const branch = restaurant.branches.find((b) => b.id === rawBranch);
  orderingStore.setState((state) => ({
    ...state,
    table,
    branchId: branch?.id ?? state.branchId,
    fulfillment: "dine-in",
    scheduledFor: null,
  }));
  return table;
}

export function leaveTable() {
  orderingStore.setState((state) => ({
    ...state,
    table: null,
    fulfillment: state.fulfillment === "dine-in" ? defaultFulfillment() : state.fulfillment,
  }));
}

export const FULFILLMENT_LABELS: Record<FulfillmentMethod, string> = {
  delivery: "توصيل",
  pickup: "استلام",
  "dine-in": "داخل المطعم",
};

/** Methods offered right now; dine-in needs a table from the QR code. */
export function availableFulfillments(table: string | null): FulfillmentMethod[] {
  return FULFILLMENTS.filter((f) => restaurant.fulfillment[f] && (f !== "dine-in" || table));
}
