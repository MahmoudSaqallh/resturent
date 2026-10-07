"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ChevronLeft, Phone, ReceiptText, SearchX } from "lucide-react";
import type { Order } from "@/types";
import { restaurant } from "@/data/restaurant";
import { formatDateTime, formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/store";
import { findOrderByNumber, STATUS_LABELS, useOrders } from "@/features/orders/store";
import { buttonClasses } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { contactLinks, whatsappLink, WhatsAppIcon } from "@/components/ui/brand";

/**
 * Order lookup. Without an order backend, only orders placed from this
 * device can be shown; anything else goes to the restaurant directly.
 * No status is invented here.
 */
export function TrackOrderView() {
  const hydrated = useHydrated();
  const orders = useOrders();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ query: string; order: Order | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      setError("اكتب رقم الطلب، مثل JM-4K7P2Q.");
      return;
    }
    setError(null);
    setResult({ query: value, order: findOrderByNumber(orders, value) });
  };

  const recent = orders.slice(0, 3);

  return (
    <div className="container-page max-w-2xl py-8 md:py-12">
      <h1 className="text-2xl font-extrabold md:text-3xl">تتبع طلبك</h1>
      <p className="mt-2 text-ink-soft">اكتب رقم الطلب الذي ظهر لك بعد التأكيد.</p>

      <form noValidate onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <Field id="track-number" label="رقم الطلب" error={error ?? undefined} className="flex-1">
          <TextInput
            id="track-number"
            dir="ltr"
            autoComplete="off"
            spellCheck={false}
            placeholder="JM-XXXXXX"
            value={query}
            maxLength={20}
            invalid={Boolean(error)}
            aria-describedby={error ? "track-number-error" : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              if (error) setError(null);
            }}
            className="text-right font-mono uppercase"
          />
        </Field>
        <button type="submit" className={buttonClasses({ size: "lg", className: "sm:mt-7" })}>
          ابحث
        </button>
      </form>

      <div aria-live="polite" className="mt-6">
        {result?.order && (
          <Link
            href={`/orders/${result.order.id}`}
            className="flex items-center gap-4 rounded-lg bg-surface p-4 ring-1 ring-line transition-colors hover:bg-cream"
          >
            <ReceiptText className="size-6 shrink-0 text-brand" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="tabular block font-bold" dir="ltr">
                #{result.order.number}
              </span>
              <span className="block text-sm text-ink-muted">
                {formatDateTime(result.order.createdAt, restaurant.timeZone)} · آخر حالة مسجلة:{" "}
                {STATUS_LABELS[result.order.status]}
              </span>
            </span>
            <span className="tabular font-bold">{formatPrice(result.order.totals.total)}</span>
            <ChevronLeft className="size-4 text-ink-muted" aria-hidden="true" />
          </Link>
        )}

        {result && !result.order && (
          <div className="rounded-lg bg-surface p-5 ring-1 ring-line">
            <p className="flex items-center gap-2 font-bold">
              <SearchX className="size-5 text-ink-muted" aria-hidden="true" />
              لم نجد هذا الطلب على هذا الجهاز
            </p>
            <p className="mt-1.5 text-sm text-ink-soft">
              نعرض هنا الطلبات المرسلة من هذا الجهاز فقط. تواصل معنا وسنخبرك بحالة طلبك مباشرة.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={whatsappLink(`مرحباً، أستفسر عن حالة الطلب رقم ${result.query}`)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "dark", size: "md" })}
              >
                <WhatsAppIcon size={18} />
                اسأل عبر واتساب
              </a>
              <a href={contactLinks.phone} className={buttonClasses({ variant: "outline", size: "md" })}>
                <Phone className="size-4" aria-hidden="true" />
                اتصل بنا
              </a>
            </div>
          </div>
        )}
      </div>

      {hydrated && recent.length > 0 && !result?.order && (
        <section aria-labelledby="recent-orders" className="mt-10">
          <h2 id="recent-orders" className="text-lg font-bold">
            طلباتك الأخيرة
          </h2>
          <ul className="mt-3 divide-y divide-line rounded-lg bg-surface ring-1 ring-line">
            {recent.map((order) => (
              <li key={order.id}>
                <Link href={`/orders/${order.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream">
                  <span className="tabular flex-1 font-semibold" dir="ltr">
                    #{order.number}
                  </span>
                  <span className="text-sm text-ink-muted">{formatDateTime(order.createdAt, restaurant.timeZone)}</span>
                  <ChevronLeft className="size-4 text-ink-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/orders" className="mt-3 inline-flex h-11 items-center text-sm font-semibold underline underline-offset-4">
            كل طلباتي
          </Link>
        </section>
      )}
    </div>
  );
}
