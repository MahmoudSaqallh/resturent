"use client";

import Link from "next/link";
import { ChevronLeft, ReceiptText } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { formatDateTime, formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/store";
import { STATUS_LABELS, useOrders } from "@/features/orders/store";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { FULFILLMENT_LABELS } from "@/features/ordering/store";
import { ReorderButton } from "./reorder-button";

export function OrdersList() {
  const hydrated = useHydrated();
  const orders = useOrders();

  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <SectionHeading as="h1" title="طلباتي" description="الطلبات التي أرسلتها من هذا الجهاز." />
      <div className="mt-6">
        {!hydrated ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="جارٍ التحميل">
            <div className="skeleton h-20 rounded-lg" />
            <div className="skeleton h-20 rounded-lg" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ReceiptText className="size-7" />}
            title="لا توجد طلبات بعد"
            description="بعد ما تطلب، بتلاقي طلباتك هنا."
            action={
              <Link href="/menu" className={buttonClasses({ size: "lg" })}>
                استعرض المنيو
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id} className="rounded-lg bg-surface ring-1 ring-line">
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 rounded-t-lg p-4 transition-colors hover:bg-cream"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cream-deep">
                    <ReceiptText className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="tabular block font-bold" dir="ltr">
                      #{order.number}
                    </span>
                    <span className="block text-sm text-ink-muted">
                      {formatDateTime(order.createdAt, restaurant.timeZone)} · {FULFILLMENT_LABELS[order.fulfillment]} ·{" "}
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-ink-soft">
                      {order.lines.map((line) => `${line.quantity}× ${line.name}`).join("، ")}
                    </span>
                  </span>
                  <span className="tabular font-bold">{formatPrice(order.totals.total)}</span>
                  <ChevronLeft className="size-4 text-ink-muted" aria-hidden="true" />
                </Link>
                <ReorderButton order={order} className="border-t border-line px-4 py-3" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
