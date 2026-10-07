import type { Order, Product, Selections } from "@/types";
import { formatPrice } from "@/lib/format";
import { addToCart, type LineInput } from "@/features/cart/store";
import { getMissingRequired, getUnitPrice, sanitizeSelections } from "@/features/cart/pricing";

export interface ReorderPlan {
  /** Lines that can be added, re-priced from today's menu. */
  lines: LineInput[];
  /** Customer-facing notes: unavailable items, removed options, new prices. */
  warnings: string[];
}

const sameSelections = (a: Selections, b: Selections) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const x = [...(a[key] ?? [])].sort().join(",");
    const y = [...(b[key] ?? [])].sort().join(",");
    if (x !== y) return false;
  }
  return true;
};

/**
 * Checks a past order (or a saved meal) against today's menu without
 * touching the cart, so the customer sees every change before agreeing.
 * Prices always come from the current catalog, never from the old order.
 */
export function planReorder(
  items: { productId: string; name: string; quantity: number; selections: Selections; unitPrice?: number; note?: string }[],
  productsById: Map<string, Product>
): ReorderPlan {
  const warnings: string[] = [];
  const lines: LineInput[] = [];
  for (const item of items) {
    const product = productsById.get(item.productId);
    if (!product || !product.available) {
      warnings.push(`${item.name} غير متوفر حالياً ولن يُضاف.`);
      continue;
    }
    const selections = sanitizeSelections(product, item.selections);
    if (getMissingRequired(product, selections).length > 0) {
      warnings.push(`خيارات ${product.name} تغيّرت. أضفه من المنيو واختر من جديد.`);
      continue;
    }
    if (!sameSelections(selections, item.selections)) {
      warnings.push(`بعض خيارات ${product.name} لم تعد متاحة وستُزال.`);
    }
    const price = getUnitPrice(product, selections);
    if (item.unitPrice !== undefined && Math.abs(price - item.unitPrice) > 0.001) {
      warnings.push(`سعر ${product.name} أصبح ${formatPrice(price)} بدلاً من ${formatPrice(item.unitPrice)}.`);
    }
    lines.push({ productId: product.id, selections, quantity: item.quantity, note: item.note });
  }
  return { lines, warnings };
}

export function planOrder(order: Order, productsById: Map<string, Product>) {
  return planReorder(order.lines, productsById);
}

/** Adds the planned lines; returns how many items were added. */
export function applyPlan(plan: ReorderPlan) {
  for (const line of plan.lines) addToCart(line);
  return plan.lines.reduce((sum, line) => sum + line.quantity, 0);
}
