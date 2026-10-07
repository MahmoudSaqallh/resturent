"use client";

import { useId, useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, TicketPercent, X } from "lucide-react";
import type { CouponPreview } from "@/features/coupons/use-coupon";
import { setOrdering } from "@/features/ordering/store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * "عندك كود خصم؟" — collapsed by default so it never distracts from paying.
 * Only the server decides whether a code is valid (and re-checks on order).
 */
export function CouponField({ preview }: { preview: CouponPreview }) {
  const inputId = useId();
  const [open, setOpen] = useState(preview.status !== "none");
  const [draft, setDraft] = useState(preview.status !== "none" ? preview.code : "");

  const apply = (event: FormEvent) => {
    event.preventDefault();
    const code = draft.trim();
    if (code) setOrdering({ couponCode: code.toUpperCase() });
  };
  const remove = () => {
    setOrdering({ couponCode: null });
    setDraft("");
  };

  if (preview.status === "valid") {
    return (
      <div className="flex items-start gap-2.5 rounded-lg bg-success-tint px-3.5 py-3 text-sm" role="status">
        <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
        <p className="min-w-0 flex-1">
          <span className="font-bold">
            تم تطبيق الكود{" "}
            <span className="font-mono" dir="ltr">
              {preview.code}
            </span>
          </span>
          <span className="block text-ink-soft">
            {preview.description}
            {preview.discount > 0 && ` · وفّرت ${formatPrice(preview.discount)}`}
          </span>
        </p>
        <button
          type="button"
          onClick={remove}
          aria-label="إزالة كود الخصم"
          className="-m-1.5 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-black/5"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded="false"
        className="flex h-11 items-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline"
      >
        <TicketPercent className="size-4" aria-hidden="true" />
        عندك كود خصم؟
      </button>
    );
  }

  const failed = preview.status === "invalid" || preview.status === "error";
  const message = failed ? preview.message : undefined;

  return (
    // Nested <form> is invalid inside the checkout form, so this is a group with its own button.
    <div role="group" aria-labelledby={`${inputId}-label`}>
      <label id={`${inputId}-label`} htmlFor={inputId} className="text-sm font-semibold">
        كود الخصم
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={inputId}
          value={draft}
          dir="ltr"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={32}
          placeholder="CODE"
          aria-invalid={failed || undefined}
          aria-describedby={message ? `${inputId}-msg` : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") apply(event);
          }}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-md border bg-surface px-3 text-start font-mono text-base uppercase focus:border-ink focus:ring-3 focus:ring-ink/10 focus:outline-none",
            failed ? "border-danger" : "border-line-strong"
          )}
        />
        <button
          type="button"
          onClick={apply}
          disabled={!draft.trim() || preview.status === "checking"}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-md bg-ink px-4 text-sm font-bold text-cream transition-opacity disabled:opacity-45"
        >
          {preview.status === "checking" && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
          تطبيق
        </button>
      </div>
      {preview.status === "checking" && (
        <p className="mt-1.5 text-xs text-ink-muted" role="status">
          جارٍ التحقق من الكود…
        </p>
      )}
      {message && (
        <p id={`${inputId}-msg`} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger" role="alert">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}
    </div>
  );
}
