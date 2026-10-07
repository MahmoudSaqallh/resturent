"use client";

import { useEffect, useState } from "react";
import type { Selections } from "@/types";

/**
 * Live preview of an entered promo code for the current cart. Shown to the
 * customer only — the order API re-validates the code and computes the real
 * discount from server-side totals.
 */
export type CouponPreview =
  | { status: "none" }
  | { status: "checking"; code: string }
  | { status: "valid"; code: string; description: string; discount: number; freeDelivery: boolean }
  | { status: "invalid"; code: string; message: string }
  | { status: "error"; code: string; message: string };

const NETWORK_MESSAGE = "تعذّر التحقق من الكود. تأكد من اتصالك وحاول مرة أخرى.";

export interface CouponItem {
  productId: string;
  quantity: number;
  selections: Selections;
}

async function checkCoupon(code: string, items: CouponItem[], signal: AbortSignal): Promise<CouponPreview> {
  const response = await fetch("/api/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, items }),
    signal,
  });
  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (data?.ok === true && typeof data.discount === "number") {
    return {
      status: "valid",
      code: String(data.code ?? code),
      description: String(data.description ?? ""),
      discount: data.discount,
      freeDelivery: data.freeDelivery === true,
    };
  }
  if (data && typeof data.message === "string") return { status: "invalid", code, message: data.message };
  return { status: "error", code, message: NETWORK_MESSAGE };
}

/** `items` must be stable while the cart is unchanged (memoised by the caller). */
export function useCouponPreview(code: string | null, items: CouponItem[]): CouponPreview {
  const key = code ? `${code}|${JSON.stringify(items)}` : null;
  const [result, setResult] = useState<{ key: string; preview: CouponPreview } | null>(null);

  useEffect(() => {
    if (!key || !code) return;
    const controller = new AbortController();
    // Debounced: quantity steppers change the total several times in a row.
    const timer = setTimeout(() => {
      checkCoupon(code, items, controller.signal)
        .then((preview) => setResult({ key, preview }))
        .catch(() => {
          if (!controller.signal.aborted) setResult({ key, preview: { status: "error", code, message: NETWORK_MESSAGE } });
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, code, items]);

  if (!code) return { status: "none" };
  if (!result || result.key !== key) return { status: "checking", code };
  return result.preview;
}
