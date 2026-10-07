import type { OpeningHours } from "@/types";

/* Pure opening-hours logic, evaluated in the restaurant's time zone so the
   result is the same for every visitor and for the order API. */

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function zonedNow(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    day: WEEKDAYS.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export interface RestaurantStatus {
  isOpen: boolean;
  /** "HH:MM" closing time while open. */
  closesAt?: string;
  /** Next opening while closed. dayOffset 0 = today, 1 = tomorrow. */
  opensAt?: { dayOffset: number; day: number; time: string };
  /** Today's weekday in the restaurant time zone. */
  today: number;
}

export function getRestaurantStatus(hours: OpeningHours[], timeZone: string, date: Date): RestaurantStatus {
  const { day, minutes } = zonedNow(timeZone, date);
  const forDay = (d: number) => hours.find((entry) => entry.day === ((d % 7) + 7) % 7);

  // Yesterday's shift may run past midnight.
  const yesterday = forDay(day - 1);
  if (yesterday && toMinutes(yesterday.close) <= toMinutes(yesterday.open) && minutes < toMinutes(yesterday.close)) {
    return { isOpen: true, closesAt: yesterday.close, today: day };
  }

  const todays = forDay(day);
  if (todays) {
    const open = toMinutes(todays.open);
    const close = toMinutes(todays.close);
    const overnight = close <= open;
    if (minutes >= open && (overnight || minutes < close)) {
      return { isOpen: true, closesAt: todays.close, today: day };
    }
    if (minutes < open) {
      return { isOpen: false, opensAt: { dayOffset: 0, day, time: todays.open }, today: day };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const next = forDay(day + offset);
    if (next) {
      return { isOpen: false, opensAt: { dayOffset: offset, day: next.day, time: next.open }, today: day };
    }
  }
  return { isOpen: false, today: day };
}
