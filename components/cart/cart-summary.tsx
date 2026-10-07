import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AnimatedPrice } from "@/components/ui/price";

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  /** Promo-code discount, with the code shown next to it. */
  couponDiscount?: number;
  couponCode?: string;
  /** null = not known yet (no delivery zone chosen); undefined = pickup / not applicable. */
  deliveryFee?: number | null;
  total: number;
  deliveryNote?: string;
  className?: string;
}

/** Only rows that have a real value are shown; the final total is the anchor. */
export function CartSummary({
  subtotal,
  discount,
  couponDiscount = 0,
  couponCode,
  deliveryFee,
  total,
  deliveryNote,
  className,
}: CartSummaryProps) {
  return (
    <dl className={cn("flex flex-col gap-2 text-sm", className)}>
      <div className="flex items-center justify-between">
        <dt className="text-ink-soft">المجموع الفرعي</dt>
        <dd className="tabular font-semibold">{formatPrice(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex items-center justify-between text-success">
          <dt>خصم العروض</dt>
          <dd className="tabular font-semibold">− {formatPrice(discount)}</dd>
        </div>
      )}
      {couponDiscount > 0 && (
        <div className="flex items-center justify-between text-success">
          <dt>
            كود الخصم
            {couponCode && (
              <span className="ms-1.5 font-mono text-xs font-semibold" dir="ltr">
                {couponCode}
              </span>
            )}
          </dt>
          <dd className="tabular font-semibold">− {formatPrice(couponDiscount)}</dd>
        </div>
      )}
      {typeof deliveryFee === "number" && (
        <div className="flex items-center justify-between">
          <dt className="text-ink-soft">رسوم التوصيل</dt>
          <dd className="tabular font-semibold">{deliveryFee === 0 ? "مجاناً" : formatPrice(deliveryFee)}</dd>
        </div>
      )}
      {deliveryNote && <p className="text-xs text-ink-muted">{deliveryNote}</p>}
      <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
        <dt className="text-base font-bold">المجموع النهائي</dt>
        <dd className="text-2xl font-extrabold">
          <AnimatedPrice amount={total} />
        </dd>
      </div>
    </dl>
  );
}

/** "باقي 12 ₪ لتحصل على توصيل مجاني" — only when the restaurant offers it. */
export function FreeDeliveryProgress({
  remaining,
  threshold,
  className,
}: {
  remaining: number | null;
  threshold?: number;
  className?: string;
}) {
  if (remaining === null || !threshold) return null;
  const reached = remaining <= 0;
  const progress = Math.min(1, Math.max(0, (threshold - remaining) / threshold));
  return (
    <div className={cn("text-sm", className)}>
      <p className={cn("font-semibold", reached ? "text-success" : "text-ink")}>
        {reached ? "طلبك يحصل على توصيل مجاني" : `باقي ${formatPrice(remaining)} لتحصل على توصيل مجاني`}
      </p>
      <div
        role="progressbar"
        aria-label="التقدّم نحو التوصيل المجاني"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-deep"
      >
        <div
          className={cn(
            "h-full origin-[right] rounded-full transition-transform duration-500 ease-out motion-reduce:transition-none",
            reached ? "bg-success" : "bg-brand"
          )}
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}
