import type { Branch, RestaurantInfo } from "@/types";
import { DAY_NAMES, formatClock } from "@/lib/format";
import { getRestaurantStatus, zonedNow, type RestaurantStatus } from "./hours";

/* Pure ordering rules shared by the UI and the order API: can a customer
   order now, can they schedule, and which times are valid. */

export type OrderingBlock = "closed" | "manual" | "paused" | "branch";

export interface OrderingState {
  status: RestaurantStatus;
  canOrderNow: boolean;
  canSchedule: boolean;
  /** Why ordering *now* is unavailable. */
  reason: OrderingBlock | null;
  /** Kitchen load when reported (never guessed). */
  load?: "normal" | "high" | "very-high";
  pausedUntil?: string;
}

export interface ScheduleSlot {
  iso: string;
  dayKey: string;
  dayLabel: string;
  timeLabel: string;
}

const MINUTE = 60_000;

export function getBranch(info: RestaurantInfo, branchId?: string): Branch {
  return info.branches.find((b) => b.id === branchId) ?? info.branches[0];
}

function dayKey(timeZone: string, date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function clockIn(timeZone: string, date: Date) {
  const { minutes } = zonedNow(timeZone, date);
  return formatClock(`${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`);
}

function isPaused(info: RestaurantInfo, at: Date) {
  const until = info.operations.pausedUntil ? Date.parse(info.operations.pausedUntil) : NaN;
  return Number.isFinite(until) && at.getTime() < until;
}

/** Valid scheduled slots: inside working hours, after the lead time and any pause. */
export function getScheduleSlots(info: RestaurantInfo, branch: Branch, now: Date): ScheduleSlot[] {
  const { scheduling, timeZone } = info;
  if (!scheduling.enabled || info.operations.manualClosed || !branch.acceptingOrders) return [];
  const step = scheduling.slotMinutes * MINUTE;
  const first = Math.ceil((now.getTime() + scheduling.leadMinutes * MINUTE) / step) * step;
  const last = now.getTime() + scheduling.daysAhead * 24 * 60 * MINUTE;
  const today = dayKey(timeZone, now);
  const tomorrow = dayKey(timeZone, new Date(now.getTime() + 24 * 60 * MINUTE));

  const slots: ScheduleSlot[] = [];
  for (let t = first; t <= last; t += step) {
    const at = new Date(t);
    if (isPaused(info, at) || !getRestaurantStatus(branch.hours, timeZone, at).isOpen) continue;
    const key = dayKey(timeZone, at);
    slots.push({
      iso: at.toISOString(),
      dayKey: key,
      dayLabel: key === today ? "اليوم" : key === tomorrow ? "غداً" : DAY_NAMES[zonedNow(timeZone, at).day],
      timeLabel: clockIn(timeZone, at),
    });
  }
  return slots;
}

export function getOrderingState(info: RestaurantInfo, branch: Branch, now: Date): OrderingState {
  const status = getRestaurantStatus(branch.hours, info.timeZone, now);
  let reason: OrderingBlock | null = null;
  if (!branch.acceptingOrders) reason = "branch";
  else if (info.operations.manualClosed) reason = "manual";
  else if (isPaused(info, now)) reason = "paused";
  else if (!status.isOpen && !info.acceptOrdersWhenClosed) reason = "closed";

  return {
    status,
    canOrderNow: reason === null,
    canSchedule: getScheduleSlots(info, branch, now).length > 0,
    reason,
    load: info.operations.load,
    pausedUntil: info.operations.pausedUntil,
  };
}

/** Server-side check for a requested time (small grace for slow checkouts). */
export function isValidScheduledTime(info: RestaurantInfo, branch: Branch, iso: string, now: Date) {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return false;
  const earliest = now.getTime() + (info.scheduling.leadMinutes - 10) * MINUTE;
  const latest = now.getTime() + info.scheduling.daysAhead * 24 * 60 * MINUTE;
  if (!info.scheduling.enabled || at < earliest || at > latest) return false;
  if (info.operations.manualClosed || !branch.acceptingOrders || isPaused(info, new Date(at))) return false;
  return getRestaurantStatus(branch.hours, info.timeZone, new Date(at)).isOpen;
}

export function describeSchedule(info: RestaurantInfo, iso: string, now: Date) {
  const at = new Date(iso);
  const key = dayKey(info.timeZone, at);
  const day =
    key === dayKey(info.timeZone, now)
      ? "اليوم"
      : key === dayKey(info.timeZone, new Date(now.getTime() + 24 * 60 * MINUTE))
        ? "غداً"
        : DAY_NAMES[zonedNow(info.timeZone, at).day];
  return `${day} ${clockIn(info.timeZone, at)}`;
}
