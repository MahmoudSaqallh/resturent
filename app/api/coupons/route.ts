import { coupons } from "@/data/coupons";
import { getMenu } from "@/features/menu/api";
import { couponMessage, findCoupon, validateCoupon, type CouponLine } from "@/features/coupons/validate";
import { clampQuantity, getUnitPrice, sanitizeSelections } from "@/features/cart/pricing";
import { isRecord } from "@/lib/is-record";
import type { Selections } from "@/types";

const MAX_LINES = 50;
const invalid = () => Response.json({ ok: false, reason: "invalid", message: "تعذّر التحقق من الكود." }, { status: 400 });

/**
 * Previews a promo code for the current cart. Lines are re-priced from the
 * catalog here (client totals are never trusted), and the order API
 * re-validates the code again on submit. The code list never leaves the server.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalid();
  }
  if (!isRecord(body) || typeof body.code !== "string" || body.code.length > 32 || !Array.isArray(body.items)) {
    return invalid();
  }
  if (body.items.length > MAX_LINES) return invalid();

  const menu = await getMenu();
  const productsById = new Map(menu.products.map((p) => [p.id, p]));
  const lines: CouponLine[] = [];
  for (const item of body.items) {
    if (!isRecord(item) || typeof item.productId !== "string") continue;
    const product = productsById.get(item.productId);
    if (!product || !product.available) continue;
    const selections = sanitizeSelections(product, isRecord(item.selections) ? (item.selections as Selections) : {});
    const quantity = clampQuantity(typeof item.quantity === "number" ? item.quantity : 1);
    lines.push({ categoryId: product.categoryId, total: getUnitPrice(product, selections) * quantity });
  }

  const result = validateCoupon(coupons, body.code, lines, new Date());
  if (!result.ok) {
    const message = couponMessage(result, findCoupon(coupons, body.code), menu.categories);
    return Response.json({ ok: false, reason: result.reason, message });
  }
  return Response.json({
    ok: true,
    code: result.coupon.code,
    description: result.coupon.description,
    discount: result.discount,
    freeDelivery: result.freeDelivery,
  });
}
