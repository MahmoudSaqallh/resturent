"use client";

import { CircleAlert, Clock, UtensilsCrossed, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useOnline } from "@/lib/use-online";
import { leaveTable, useOrdering } from "@/features/ordering/store";
import { describeBlock, useOrderingState } from "@/features/restaurant/use-status";

function Notice({ tone, icon, children }: { tone: "info" | "warn" | "dark"; icon: ReactNode; children: ReactNode }) {
  return (
    <div
      className={cn(
        "text-sm",
        tone === "info" && "bg-mustard-tint text-ink",
        tone === "warn" && "bg-danger-tint text-danger",
        tone === "dark" && "bg-ink text-cream"
      )}
    >
      <div className="container-page flex min-h-11 items-center gap-2.5 py-2">
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">{children}</div>
      </div>
    </div>
  );
}

/**
 * Slim site-wide notices: connectivity, dine-in table, and real operational
 * states (manual close, pause, busy). Browsing always stays available.
 */
export function SiteNotices() {
  const online = useOnline();
  const { table, fulfillment, branchId } = useOrdering();
  const ordering = useOrderingState(branchId);

  // "closed" (outside hours) is shown by the status pill and at checkout, not as a banner.
  const operational = ordering && ordering.reason && ordering.reason !== "closed" ? describeBlock(ordering) : null;

  return (
    <div aria-live="polite" className="print:hidden">
      {!online && (
        <Notice tone="dark" icon={<WifiOff className="size-4" />}>
          <p>أنت غير متصل بالإنترنت. يمكنك تصفح المنيو، وإتمام الطلب يحتاج اتصالاً.</p>
        </Notice>
      )}
      {operational && (
        <Notice tone="warn" icon={<CircleAlert className="size-4" />}>
          <p className="font-semibold">{operational}</p>
        </Notice>
      )}
      {!operational && (ordering?.load === "high" || ordering?.load === "very-high") && (
        <Notice tone="info" icon={<Clock className="size-4" />}>
          <p>
            {ordering.load === "very-high"
              ? "وقت انتظار أطول من المعتاد. شكراً لصبرك."
              : "الطلبات مرتفعة حالياً، وقد يتأخر التحضير قليلاً."}
          </p>
        </Notice>
      )}
      {table && fulfillment === "dine-in" && (
        <Notice tone="info" icon={<UtensilsCrossed className="size-4" />}>
          <p>
            تطلب من <span className="font-bold">طاولة {table}</span> داخل المطعم.
          </p>
          <button type="button" onClick={leaveTable} className="h-9 font-semibold underline underline-offset-4">
            لست في المطعم؟
          </button>
        </Notice>
      )}
    </div>
  );
}
