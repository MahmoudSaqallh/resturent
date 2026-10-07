import type { Product, Promotion } from "@/types";
import { formatClock } from "@/lib/format";
import { zonedNow } from "@/features/restaurant/hours";

/* Time-based availability (breakfast, late-night…) and dated promotions.
   Shared by the UI and the order API so both apply the same rules. */

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function inWindow(minutes: number, from: string, to: string) {
  const a = toMinutes(from);
  const b = toMinutes(to);
  // A window like 22:00–02:00 runs past midnight.
  return a <= b ? minutes >= a && minutes < b : minutes >= a || minutes < b;
}

/** Orderable at this moment: in stock and inside any configured time window. */
export function isOrderableAt(product: Product, timeZone: string, at: Date) {
  if (!product.available) return false;
  if (!product.availableTimes?.length) return true;
  const { minutes } = zonedNow(timeZone, at);
  return product.availableTimes.some((w) => inWindow(minutes, w.from, w.to));
}

/** "يتوفر 7:00 ص – 11:00 ص" for time-limited items, else null. */
export function describeAvailableTimes(product: Product) {
  if (!product.availableTimes?.length) return null;
  return product.availableTimes.map((w) => `${formatClock(w.from)} – ${formatClock(w.to)}`).join("، ");
}

/** A promotion is live between its optional start and end dates. */
export function isPromotionLive(promotion: Pick<Promotion, "startsAt" | "endsAt">, now: number) {
  if (promotion.startsAt && Date.parse(promotion.startsAt) > now) return false;
  if (promotion.endsAt && Date.parse(promotion.endsAt) <= now) return false;
  return true;
}
