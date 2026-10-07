"use client";

import { useMemo, useSyncExternalStore } from "react";
import { restaurant } from "@/data/restaurant";
import { DAY_NAMES, formatClock } from "@/lib/format";
import { getRestaurantStatus, zonedNow, type RestaurantStatus } from "./hours";
import { getBranch, getOrderingState, getScheduleSlots, type OrderingState, type ScheduleSlot } from "./ordering";

/* A shared minute clock. The server snapshot is null so pages never bake a
   build-time "open/closed" into static HTML. */

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
const currentMinute = () => Math.floor(Date.now() / 60_000);
let minute = typeof window === "undefined" ? 0 : currentMinute();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    minute = currentMinute();
    timer = setInterval(() => {
      const next = currentMinute();
      if (next !== minute) {
        minute = next;
        listeners.forEach((l) => l());
      }
    }, 15_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Current minute (epoch minutes); null during SSR and hydration. */
export function useMinute(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => minute,
    () => null
  );
}

export function useRestaurantStatus(): RestaurantStatus | null {
  const now = useMinute();
  return useMemo(
    () => (now === null ? null : getRestaurantStatus(restaurant.hours, restaurant.timeZone, new Date(now * 60_000))),
    [now]
  );
}

/** Ordering rules for a branch (open, paused, manual close, schedulable). */
export function useOrderingState(branchId?: string): OrderingState | null {
  const now = useMinute();
  return useMemo(
    () => (now === null ? null : getOrderingState(restaurant, getBranch(restaurant, branchId), new Date(now * 60_000))),
    [now, branchId]
  );
}

/** Valid scheduled-order slots for a branch, refreshed every minute. */
export function useScheduleSlots(branchId?: string): ScheduleSlot[] {
  const now = useMinute();
  return useMemo(
    () => (now === null ? [] : getScheduleSlots(restaurant, getBranch(restaurant, branchId), new Date(now * 60_000))),
    [now, branchId]
  );
}

/** Short customer-facing reason ordering now is unavailable. */
export function describeBlock(state: OrderingState) {
  switch (state.reason) {
    case "manual":
      return restaurant.operations.message ?? "المطعم مغلق اليوم ولا يستقبل طلبات.";
    case "paused":
      return state.pausedUntil
        ? `استقبال الطلبات متوقف مؤقتاً حتى ${formatClock(clockOf(state.pausedUntil))}.`
        : "استقبال الطلبات متوقف مؤقتاً.";
    case "branch":
      return "هذا الفرع لا يستقبل طلبات حالياً.";
    case "closed":
      return `المطعم مغلق حالياً · ${describeOpening(state.status)}.`;
    default:
      return "";
  }
}

function clockOf(iso: string) {
  const { minutes } = zonedNow(restaurant.timeZone, new Date(iso));
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

/** "يفتح اليوم 11:00 ص" / "يفتح غداً …" / "يفتح يوم الجمعة …" */
export function describeOpening(status: RestaurantStatus) {
  if (!status.opensAt) return "";
  const { dayOffset, day, time } = status.opensAt;
  const when = dayOffset === 0 ? "اليوم" : dayOffset === 1 ? "غداً" : `يوم ${DAY_NAMES[day]}`;
  return `يفتح ${when} ${formatClock(time)}`;
}
