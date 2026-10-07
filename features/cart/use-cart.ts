"use client";

import { useMemo } from "react";
import type { CartItem, Product } from "@/types";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/features/menu/catalog";
import { cartStore } from "./store";
import { computeTotals, describeSelections, getRegularUnitPrice, getUnitPrice, sanitizeSelections } from "./pricing";

export interface ResolvedLine {
  item: CartItem;
  product: Product;
  quantity: number;
  unitPrice: number;
  regularUnitPrice: number;
  total: number;
  options: string[];
  unavailable: boolean;
}

const selectItems = (state: { items: CartItem[] }) => state.items;

export function useCartItems() {
  return useStore(cartStore, selectItems);
}

/** Cart lines priced against the current catalog. Unknown products are skipped. */
export function useCartLines(): ResolvedLine[] {
  const items = useCartItems();
  const { productsById } = useCatalog();
  return useMemo(() => {
    const lines: ResolvedLine[] = [];
    for (const item of items) {
      const product = productsById.get(item.productId);
      if (!product) continue;
      const selections = sanitizeSelections(product, item.selections);
      const unitPrice = getUnitPrice(product, selections);
      lines.push({
        item,
        product,
        quantity: item.quantity,
        unitPrice,
        regularUnitPrice: getRegularUnitPrice(product, selections),
        total: unitPrice * item.quantity,
        options: describeSelections(product, selections),
        unavailable: !product.available,
      });
    }
    return lines;
  }, [items, productsById]);
}

export function useCartSummary(deliveryFee = 0) {
  const lines = useCartLines();
  const items = useCartItems();
  const { complete } = useCatalog();
  // With a partial catalog some lines can't be priced yet; totals would under-count.
  const pending = !complete && items.length > 0;
  return useMemo(() => ({ lines, pending, ...computeTotals(lines, deliveryFee) }), [lines, pending, deliveryFee]);
}

/** Total quantity of a product across all its lines. */
export function useProductQuantity(productId: string) {
  return useStore(cartStore, (state) =>
    state.items.reduce((sum, item) => (item.productId === productId ? sum + item.quantity : sum), 0)
  );
}

export function useCartCount() {
  return useStore(cartStore, (state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
}
