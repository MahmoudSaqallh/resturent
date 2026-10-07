import type { Order, OrderErrorCode, OrderErrorResponse, OrderRequest } from "@/types";

export type SubmitResult =
  | { ok: true; order: Order }
  | { ok: false; kind: "network" | "server"; code?: OrderErrorCode; message: string; productIds?: string[] };

const TIMEOUT_MS = 15_000;

export async function submitOrder(request: OrderRequest): Promise<SubmitResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    const data: unknown = await response.json().catch(() => null);
    if (response.ok && data && typeof data === "object" && "order" in data) {
      return { ok: true, order: (data as { order: Order }).order };
    }
    const error = (data as OrderErrorResponse | null)?.error;
    return {
      ok: false,
      kind: "server",
      code: error?.code,
      message: error?.message ?? "لم نتمكن من إرسال الطلب. حاول مرة أخرى بعد قليل.",
      productIds: error?.productIds,
    };
  } catch {
    return {
      ok: false,
      kind: "network",
      message: "تعذّر الاتصال. تأكد من اتصالك بالإنترنت ثم حاول مرة أخرى — سلتك محفوظة.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
