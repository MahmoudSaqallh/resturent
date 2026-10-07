import { Clock, Flame } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/cn";
import { formatClock } from "@/lib/format";

type BadgeTone = "brand" | "mustard" | "ink" | "success" | "muted";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand text-white",
  mustard: "bg-mustard text-ink",
  ink: "bg-ink text-cream",
  success: "bg-success-tint text-success",
  muted: "bg-cream-deep text-ink-soft",
};

export function Badge({ tone = "ink", className, children }: { tone?: BadgeTone; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-sm px-2 text-xs leading-none font-bold whitespace-nowrap",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** At most one promotional badge per product, by priority. */
export function getPrimaryBadge(product: Product): { label: string; tone: BadgeTone } | null {
  if (!product.available) return null;
  if (product.oldPrice && product.oldPrice > product.price) return { label: "عرض", tone: "brand" };
  if (product.popular) return { label: "الأكثر طلباً", tone: "mustard" };
  if (product.isNew) return { label: "جديد", tone: "ink" };
  return null;
}

export const SPICY_LABELS = ["غير حار", "خفيف", "متوسط", "حار"] as const;

/**
 * Flame icons + text label, so the level is not conveyed by icons alone.
 * Level 0 ("غير حار") is shown only in detailed views, and only when the
 * product data states it explicitly.
 */
export function SpicyIndicator({
  level,
  showLabel = false,
  tone = "default",
  className,
}: {
  level?: number;
  showLabel?: boolean;
  tone?: "default" | "light";
  className?: string;
}) {
  if (level === undefined || level < 0 || level > 3) return null;
  if (level === 0 && !showLabel) return null;
  const label = SPICY_LABELS[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        level === 0 ? "text-ink-muted" : tone === "light" ? "text-brand-glow" : "text-brand-ink",
        className
      )}
    >
      <span className="inline-flex" aria-hidden="true">
        {Array.from({ length: Math.max(level, 1) }, (_, i) => (
          <Flame
            key={i}
            className={cn("-ms-0.5 size-3.5 first:ms-0", level === 0 ? "opacity-50" : "fill-brand/25")}
            strokeWidth={2.25}
          />
        ))}
      </span>
      <span className={showLabel ? "text-xs font-semibold" : "sr-only"}>
        {showLabel ? (level === 0 ? label : `حرارة: ${label}`) : `مستوى الحرارة: ${label}`}
      </span>
    </span>
  );
}

/**
 * Real stock / time signals as quiet text (not another badge):
 * "كمية محدودة" when the kitchen flags low stock, and the serving window
 * for time-limited items. Unavailable items are handled by the card itself.
 */
export function StockNote({ product, className }: { product: Product; className?: string }) {
  if (!product.available) return null;
  const times = product.availableTimes?.length
    ? product.availableTimes.map((w) => `${formatClock(w.from)} – ${formatClock(w.to)}`).join("، ")
    : null;
  if (product.stock !== "limited" && !times) return null;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold", className)}>
      {product.stock === "limited" && <span className="text-brand-ink">كمية محدودة</span>}
      {times && (
        <span className="inline-flex items-center gap-1 text-ink-muted">
          <Clock className="size-3.5" aria-hidden="true" />
          يتوفر {times}
        </span>
      )}
    </p>
  );
}
