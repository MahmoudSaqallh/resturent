"use client";

import { useMemo } from "react";
import type { Product, Promotion } from "@/types";
import { useCatalog } from "./catalog";

export function useOffers() {
  const { promotions, productsById } = useCatalog();
  return useMemo(
    () =>
      promotions
        .map((promotion) => ({ promotion, product: productsById.get(promotion.productId) }))
        .filter((entry): entry is { promotion: Promotion; product: Product } => Boolean(entry.product)),
    [promotions, productsById]
  );
}
