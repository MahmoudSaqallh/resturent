import type { OptionChoice, Product, ProductOption, Selections } from "@/types";

/* ------------------------------------------------------------------
   Pure pricing + option rules. Shared by the client and the order API,
   so the server re-prices every order from the catalog.
   ------------------------------------------------------------------ */

export const MAX_LINE_QUANTITY = 20;
export const MAX_NOTE_LENGTH = 200;

export function isChoiceAvailable(choice: OptionChoice) {
  return choice.available !== false;
}

/** Drops unknown/unavailable ids and enforces single/multiple limits. */
export function sanitizeSelections(product: Product, selections: Selections | undefined): Selections {
  const clean: Selections = {};
  if (!selections) return clean;
  for (const option of product.options ?? []) {
    const picked = selections[option.id];
    if (!Array.isArray(picked)) continue;
    const valid = [...new Set(picked)].filter((id) =>
      option.choices.some((choice) => choice.id === id && isChoiceAvailable(choice))
    );
    const limit = option.selection === "single" ? 1 : (option.maxSelections ?? option.choices.length);
    const kept = valid.slice(0, limit);
    if (kept.length > 0) clean[option.id] = kept;
  }
  return clean;
}

/** Fills groups that have no selection with their defaults. */
export function withDefaults(product: Product, selections?: Selections): Selections {
  const result: Selections = { ...sanitizeSelections(product, selections) };
  for (const option of product.options ?? []) {
    if (result[option.id]?.length) continue;
    const defaults = (option.defaultChoiceIds ?? []).filter((id) =>
      option.choices.some((choice) => choice.id === id && isChoiceAvailable(choice))
    );
    if (defaults.length > 0) result[option.id] = defaults;
  }
  return result;
}

export function getMissingRequired(product: Product, selections: Selections): ProductOption[] {
  return (product.options ?? []).filter((option) => option.required && !selections[option.id]?.length);
}

/** Products with a required choice open the details view instead of quick add. */
export function needsConfiguration(product: Product) {
  return (product.options ?? []).some((option) => option.required);
}

function optionsDelta(product: Product, selections: Selections) {
  let delta = 0;
  for (const option of product.options ?? []) {
    for (const id of selections[option.id] ?? []) {
      delta += option.choices.find((choice) => choice.id === id)?.priceDelta ?? 0;
    }
  }
  return delta;
}

export function getUnitPrice(product: Product, selections: Selections) {
  return product.price + optionsDelta(product, selections) - (product.bundleDiscount ?? 0);
}

/** Price before offers, used for the "discount" line and struck-through prices. */
export function getRegularUnitPrice(product: Product, selections: Selections) {
  return (product.oldPrice ?? product.price) + optionsDelta(product, selections);
}

/** Lowest possible price; `isFrom` when choices can raise it ("ابتداءً من"). */
export function getStartingPrice(product: Product): { amount: number; isFrom: boolean } {
  let amount = product.price - (product.bundleDiscount ?? 0);
  let isFrom = false;
  for (const option of product.options ?? []) {
    if (!option.required) continue;
    const deltas = option.choices.filter(isChoiceAvailable).map((choice) => choice.priceDelta);
    if (deltas.length === 0) continue;
    const min = Math.min(...deltas);
    amount += min;
    if (Math.max(...deltas) !== min) isFrom = true;
  }
  return { amount, isFrom };
}

/** Human-readable option lines for cart, review and receipts. */
export function describeSelections(product: Product, selections: Selections): string[] {
  const lines: string[] = [];
  for (const option of product.options ?? []) {
    const labels = (selections[option.id] ?? [])
      .map((id) => option.choices.find((choice) => choice.id === id)?.label)
      .filter((label): label is string => Boolean(label));
    if (labels.length === 0) continue;
    if (option.kind === "remove") lines.push(labels.join("، "));
    // "اختر المشروب" reads as an instruction; summaries show "المشروب: …".
    else lines.push(`${option.name.replace(/^اختر\s+/, "")}: ${labels.join("، ")}`);
  }
  return lines;
}

/** Same product + same options + same note = same cart line. */
export function lineKey(productId: string, selections: Selections, note?: string) {
  const normalized = Object.keys(selections)
    .sort()
    .map((key) => `${key}=${[...selections[key]].sort().join(",")}`)
    .join("|");
  return `${productId}::${normalized}::${(note ?? "").trim()}`;
}

export function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.round(quantity)));
}

export interface PricedLine {
  quantity: number;
  unitPrice: number;
  regularUnitPrice: number;
}

export function computeTotals(lines: PricedLine[], deliveryFee = 0) {
  let subtotal = 0;
  let itemsTotal = 0;
  let itemCount = 0;
  for (const line of lines) {
    subtotal += line.regularUnitPrice * line.quantity;
    itemsTotal += line.unitPrice * line.quantity;
    itemCount += line.quantity;
  }
  const discount = Math.max(0, subtotal - itemsTotal);
  return {
    subtotal,
    discount,
    itemsTotal,
    deliveryFee,
    total: itemsTotal + deliveryFee,
    itemCount,
  };
}

/**
 * Photo for the chosen variation, when the menu provides a real one
 * (`OptionChoice.image`). Later option groups win (e.g. flavour over size).
 */
export function getVariantImage(product: Product, selections: Selections): string | undefined {
  let image: string | undefined;
  for (const option of product.options ?? []) {
    for (const id of selections[option.id] ?? []) {
      const choice = option.choices.find((c) => c.id === id);
      if (choice?.image) image = choice.image;
    }
  }
  return image;
}
