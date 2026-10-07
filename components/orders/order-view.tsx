"use client";

import Link from "next/link";
import { useRef } from "react";
import { Check, CircleCheck, Phone, SearchX } from "lucide-react";
import type { FulfillmentMethod, Order } from "@/types";
import { getBranch } from "@/features/restaurant/ordering";
import { ReorderButton } from "./reorder-button";
import { PrintReceiptButton } from "./print-receipt-button";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/cn";
import { formatDateTime, formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/store";
import { gsap, MOTION_OK_QUERY, useGSAP } from "@/lib/motion";
import { statusSteps, useOrder } from "@/features/orders/store";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { contactLinks, WhatsAppIcon } from "@/components/ui/brand";
import { CartSummary } from "@/components/cart/cart-summary";
import { FoodImage } from "@/components/products/food-image";

const PAYMENT_LABELS = Object.fromEntries(restaurant.paymentMethods.map((m) => [m.id, m.label]));
const FULFILLMENT_TEXT: Record<FulfillmentMethod, string> = {
  delivery: "توصيل",
  pickup: "استلام من المطعم",
  "dine-in": "داخل المطعم",
};

function Timeline({ order }: { order: Order }) {
  const steps = statusSteps(order.fulfillment);
  const current = steps.findIndex((step) => step.status === order.status);
  return (
    <ol className="relative flex flex-col">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const last = index === steps.length - 1;
        return (
          <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0" aria-current={active ? "step" : undefined}>
            {!last && (
              <span
                aria-hidden="true"
                className={cn("absolute start-[0.9375rem] top-8 bottom-0 w-0.5", done ? "bg-success" : "bg-line")}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                done && "bg-success text-white",
                active && "bg-brand text-white ring-4 ring-brand-tint",
                !done && !active && "bg-cream-deep text-ink-muted"
              )}
            >
              {done || active ? (
                <Check className="size-4" strokeWidth={3} aria-hidden="true" />
              ) : (
                <span className="size-2 rounded-full bg-current" aria-hidden="true" />
              )}
            </span>
            <div className="pt-1">
              <p className={cn("font-bold", !done && !active && "text-ink-muted")}>{step.label}</p>
              {active && (
                <p className="text-sm text-ink-muted">
                  {formatDateTime(order.createdAt, restaurant.timeZone)}
                </p>
              )}
              <span className="sr-only">{done ? "(مكتمل)" : active ? "(الحالة الحالية)" : "(لم يبدأ بعد)"}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderView({ id, isNew }: { id: string; isNew: boolean }) {
  const hydrated = useHydrated();
  const order = useOrder(id);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!isNew || !order) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap
          .timeline()
          .from("[data-success-icon]", { scale: 0.9, autoAlpha: 0, duration: 0.3, ease: "power2.out" })
          .from("[data-success-text]", { y: 14, autoAlpha: 0, duration: 0.45, stagger: 0.08, ease: "power3.out" }, "-=0.2");
      });
    },
    { scope: heroRef, dependencies: [Boolean(order), isNew] }
  );

  if (!hydrated) {
    return (
      <div className="container-page flex flex-col gap-4 py-10" aria-busy="true" aria-label="جارٍ تحميل الطلب">
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-72 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<SearchX className="size-7" />}
          title="لم نجد هذا الطلب على هذا الجهاز"
          description="الطلبات تُحفظ على الجهاز الذي طُلبت منه. للاستفسار عن طلبك تواصل معنا مباشرة."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <a href={contactLinks.phone} className={buttonClasses({ variant: "outline", size: "lg" })}>
                <Phone className="size-4" aria-hidden="true" />
                اتصل بنا
              </a>
              <Link href="/" className={buttonClasses({ size: "lg" })}>
                العودة للرئيسية
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const delivery = order.fulfillment === "delivery";
  const branch = getBranch(restaurant, order.branchId);
  const paymentStatus =
    order.paymentStatus === "paid" ? "مدفوع" : order.payment === "cash" ? "الدفع عند الاستلام" : "بانتظار الدفع";
  const schedule = order.scheduledFor ? formatDateTime(order.scheduledFor, restaurant.timeZone) : null;
  const typeLabel =
    order.fulfillment === "dine-in" ? `داخل المطعم · طاولة ${order.table ?? ""}` : FULFILLMENT_TEXT[order.fulfillment];

  return (
    <div className="container-page py-8 md:py-12">
      {isNew && (
        <div ref={heroRef} className="mb-8 rounded-xl bg-ink px-5 py-8 text-center text-white md:py-10">
          <CircleCheck data-success-icon className="mx-auto size-16 text-mustard" strokeWidth={1.75} aria-hidden="true" />
          <h1 data-success-text className="mt-4 text-3xl font-black md:text-4xl">
            تم استلام طلبك 🎉
          </h1>
          <p data-success-text className="mt-2 text-white/75">
            رقم الطلب{" "}
            <span className="tabular font-bold text-white" dir="ltr">
              #{order.number}
            </span>
          </p>
          <p data-success-text className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-white/75">
            <span>{typeLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{paymentStatus}</span>
            {schedule && (
              <>
                <span aria-hidden="true">·</span>
                <span>مجدول: {schedule}</span>
              </>
            )}
          </p>
          {order.estimatedReadyAt && (
            <p data-success-text className="mt-1 text-white/75">
              الوقت المتوقع: {formatDateTime(order.estimatedReadyAt, restaurant.timeZone)}
            </p>
          )}
          <div data-success-text className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/orders/${order.id}`} className={buttonClasses({ size: "lg", className: "rounded-full px-7" })}>
              تتبع الطلب
            </Link>
            <Link href="/" className={buttonClasses({ variant: "outline-light", size: "lg", className: "rounded-full" })}>
              العودة للرئيسية
            </Link>
          </div>
        </div>
      )}

      {!isNew && (
        <h1 className="mb-6 text-2xl font-extrabold md:text-3xl">
          طلب{" "}
          <span className="tabular" dir="ltr">
            #{order.number}
          </span>
        </h1>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="tracking-title" className="rounded-xl bg-surface p-5 ring-1 ring-line md:p-6">
            <h2 id="tracking-title" className="text-lg font-bold">
              حالة الطلب
            </h2>
            <div className="mt-5">
              <Timeline order={order} />
            </div>
            <div className="mt-6 rounded-lg bg-cream p-4 text-sm">
              <p className="text-ink-soft">
                التحديث المباشر لحالة الطلب غير متاح بعد. لمعرفة حالة طلبك أو تعديله، تواصل معنا وأخبرنا برقم الطلب.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={contactLinks.phone} className={buttonClasses({ variant: "outline", size: "md" })}>
                  <Phone className="size-4" aria-hidden="true" />
                  اتصل بنا
                </a>
                <a
                  href={`${contactLinks.whatsapp}?text=${encodeURIComponent(`مرحباً، أستفسر عن الطلب رقم ${order.number}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses({ variant: "dark", size: "md" })}
                >
                  <WhatsAppIcon size={18} />
                  واتساب
                </a>
              </div>
            </div>
          </section>

          <section aria-labelledby="details-title" className="rounded-xl bg-surface p-5 ring-1 ring-line md:p-6">
            <h2 id="details-title" className="text-lg font-bold">
              تفاصيل الطلب
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-muted">نوع الطلب</dt>
                <dd className="font-semibold">{typeLabel}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">الوقت</dt>
                <dd className="font-semibold">{schedule ? `مجدول: ${schedule}` : "في أقرب وقت"}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">طريقة الدفع</dt>
                <dd className="font-semibold">{PAYMENT_LABELS[order.payment]}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">حالة الدفع</dt>
                <dd className="font-semibold">{order.paymentStatus === "paid" ? "مدفوع" : "غير مدفوع بعد"}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">الاسم</dt>
                <dd className="font-semibold">{order.customer.name}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">الهاتف</dt>
                <dd className="tabular font-semibold" dir="ltr">
                  {order.customer.phone}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-ink-muted">{delivery ? "العنوان" : "الفرع"}</dt>
                <dd className="font-semibold">
                  {delivery && order.address
                    ? [
                        order.address.zoneName,
                        order.address.street,
                        order.address.building,
                        order.address.floor && `الطابق ${order.address.floor}`,
                        order.address.landmark,
                      ]
                        .filter(Boolean)
                        .join("، ")
                    : `${branch.name} — ${branch.address}`}
                </dd>
                {order.address?.driverNotes && <dd className="mt-1 text-ink-soft">للسائق: {order.address.driverNotes}</dd>}
              </div>
              {order.customer.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-ink-muted">ملاحظات</dt>
                  <dd className="font-semibold">{order.customer.notes}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        <section aria-labelledby="summary-title" className="rounded-xl bg-surface p-5 ring-1 ring-line md:p-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <h2 id="summary-title" className="text-lg font-bold">
            ملخص الطلب
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {order.lines.map((line, index) => (
              <li key={`${line.productId}-${index}`} className="flex gap-3 py-3">
                <FoodImage src={line.image} alt="" sizes="48px" className="size-12 shrink-0 rounded-sm" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="flex justify-between gap-2 font-bold">
                    <span>
                      <span className="tabular text-ink-muted">{line.quantity}×</span> {line.name}
                    </span>
                    <span className="tabular shrink-0">{formatPrice(line.total)}</span>
                  </p>
                  {line.options.length > 0 && <p className="mt-0.5 text-xs text-ink-muted">{line.options.join(" · ")}</p>}
                  {line.note && <p className="mt-0.5 text-xs text-ink-soft">ملاحظة: {line.note}</p>}
                </div>
              </li>
            ))}
          </ul>
          <CartSummary
            className="mt-3 border-t border-line pt-4"
            subtotal={order.totals.subtotal}
            discount={order.totals.discount}
            couponDiscount={order.totals.couponDiscount}
            couponCode={order.coupon?.code}
            deliveryFee={delivery ? order.totals.deliveryFee : undefined}
            total={order.totals.total}
          />
          <div className="mt-5 flex flex-wrap items-start gap-2 border-t border-line pt-5 print:hidden">
            <ReorderButton order={order} />
            <PrintReceiptButton />
          </div>
        </section>
      </div>
    </div>
  );
}
