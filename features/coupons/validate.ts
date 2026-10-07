import type { Category, CategoryId, Coupon, CouponResult } from "@/types";

const round2 = (n: number) => Math.round(n * 100) / 100;

export const normalizeCode = (code: string) => code.trim().toUpperCase();

/** A priced cart line as the server computed it. */
export interface CouponLine {
  categoryId: CategoryId;
  total: number;
}

/**
 * Validates a promo code against server-priced lines (after offer prices,
 * before delivery). Category-limited codes count only matching lines, for
 * both the minimum and the discount. Runs on the server.
 */
export function validateCoupon(list: Coupon[], rawCode: string, lines: CouponLine[], now: Date): CouponResult {
  const code = normalizeCode(rawCode);
  const coupon = list.find((c) => c.active && normalizeCode(c.code) === code);
  if (!coupon || !code) return { ok: false, reason: "invalid" };
  if (coupon.expiresAt && Date.parse(coupon.expiresAt) < now.getTime()) return { ok: false, reason: "expired" };

  const eligible = round2(
    lines
      .filter((line) => !coupon.categoryIds || coupon.categoryIds.includes(line.categoryId))
      .reduce((sum, line) => sum + line.total, 0)
  );
  if (coupon.categoryIds && eligible <= 0) return { ok: false, reason: "category" };
  if (coupon.minimumOrder && eligible < coupon.minimumOrder) {
    return { ok: false, reason: "minimum", minimumOrder: coupon.minimumOrder };
  }

  let discount = 0;
  if (coupon.type === "percent") discount = round2((eligible * coupon.value) / 100);
  if (coupon.type === "fixed") discount = coupon.value;
  if (coupon.maxDiscount !== undefined) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, eligible);
  return { ok: true, coupon, discount, freeDelivery: coupon.type === "free-delivery" };
}

/** Customer-facing reason for a rejected code. */
export function couponMessage(
  result: Extract<CouponResult, { ok: false }>,
  coupon: Coupon | undefined,
  categories: Category[]
) {
  switch (result.reason) {
    case "expired":
      return "انتهت صلاحية هذا الكود.";
    case "minimum":
      return coupon?.categoryIds
        ? `هذا الكود يتطلب ${result.minimumOrder ?? 0} ₪ على الأقل من الأصناف المشمولة.`
        : `هذا الكود يتطلب طلباً بقيمة ${result.minimumOrder ?? 0} ₪ على الأقل.`;
    case "category": {
      const names = categories.filter((c) => coupon?.categoryIds?.includes(c.id)).map((c) => c.name);
      return names.length
        ? `هذا الكود يسري على: ${names.join("، ")}. أضف صنفاً منها لاستخدامه.`
        : "هذا الكود لا يسري على أصناف سلتك.";
    }
    default:
      return "الكود غير صحيح. تأكد منه وجرّب مرة ثانية.";
  }
}

export function findCoupon(list: Coupon[], rawCode: string) {
  const code = normalizeCode(rawCode);
  return list.find((c) => normalizeCode(c.code) === code);
}
