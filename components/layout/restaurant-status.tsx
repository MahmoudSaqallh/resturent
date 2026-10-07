"use client";

import type { OpeningHours } from "@/types";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/cn";
import { DAY_NAMES, formatClock } from "@/lib/format";
import { describeOpening, useRestaurantStatus } from "@/features/restaurant/use-status";

/**
 * Open/closed status computed from the configured hours in the restaurant's
 * time zone. Renders a placeholder until mounted so static HTML never shows
 * a stale build-time status.
 */
export function StatusPill({ tone = "default", className }: { tone?: "default" | "light"; className?: string }) {
  const status = useRestaurantStatus();
  const light = tone === "light";

  if (!status) {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-block h-8 w-36 rounded-full", light ? "bg-white/10" : "skeleton", className)}
      />
    );
  }

  const detail = status.isOpen
    ? status.closesAt
      ? `حتى ${formatClock(status.closesAt)}`
      : ""
    : describeOpening(status);

  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-semibold whitespace-nowrap",
        light ? "bg-white/10 text-white" : "bg-surface text-ink ring-1 ring-line",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-2 rounded-full", status.isOpen ? "bg-[#2fbf71]" : "bg-brand")}
      />
      {status.isOpen ? "مفتوح الآن" : "مغلق حالياً"}
      {detail && <span className={light ? "font-normal text-white/70" : "font-normal text-ink-muted"}>· {detail}</span>}
    </span>
  );
}

/** Weekly hours with today highlighted (in the restaurant's time zone). */
export function WorkingHours({
  tone = "default",
  hours = restaurant.hours,
  className,
}: {
  tone?: "default" | "light";
  hours?: OpeningHours[];
  className?: string;
}) {
  const status = useRestaurantStatus();
  const light = tone === "light";
  const ordered = [...hours].sort((a, b) => ((a.day + 1) % 7) - ((b.day + 1) % 7)); // week starts Saturday

  return (
    <ul className={cn("flex flex-col gap-0.5 text-sm", className)}>
      {ordered.map((entry) => {
        const isToday = status?.today === entry.day;
        return (
          <li
            key={entry.day}
            aria-current={isToday ? "date" : undefined}
            className={cn(
              "flex items-center justify-between gap-4 rounded-sm px-2 py-1",
              isToday && (light ? "bg-white/10 font-bold text-white" : "bg-mustard-tint font-bold text-ink"),
              !isToday && (light ? "text-white/70" : "text-ink-soft")
            )}
          >
            <span>
              {DAY_NAMES[entry.day]}
              {isToday && <span className="ms-2 text-xs font-semibold">(اليوم)</span>}
            </span>
            <span className="tabular">
              {formatClock(entry.open)} – {formatClock(entry.close)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
