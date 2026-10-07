"use client";

import Image from "next/image";
import { Check, CircleAlert } from "lucide-react";
import type { Product, ProductOption } from "@/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { isChoiceAvailable } from "@/features/cart/pricing";

interface OptionGroupProps {
  product: Product;
  option: ProductOption;
  selected: string[];
  onChange: (ids: string[]) => void;
  error?: string;
  productImages: Map<string, string>;
}

function groupHint(option: ProductOption) {
  if (option.kind === "remove") return "اختياري";
  if (option.required) return "مطلوب";
  if (option.selection === "multiple" && option.maxSelections) return `اختياري · حتى ${option.maxSelections}`;
  return "اختياري";
}

/** Accessible radio/checkbox group styled as tappable rows or size tiles. */
export function OptionGroup({ product, option, selected, onChange, error, productImages }: OptionGroupProps) {
  const name = `${product.id}-${option.id}`;
  const errorId = `${name}-error`;
  const isSize = option.kind === "size" && option.selection === "single" && option.choices.length <= 3;
  const max = option.selection === "multiple" ? (option.maxSelections ?? option.choices.length) : 1;
  const atMax = option.selection === "multiple" && selected.length >= max;
  // Size comparison: price difference against the smallest size, and a portion glyph
  // that grows modestly (72% → 100%) so the difference is visible but not exaggerated.
  const baseDelta = isSize ? Math.min(...option.choices.map((c) => c.priceDelta)) : 0;
  const glyphScale = (index: number) =>
    option.choices.length > 1 ? 0.72 + (0.28 * index) / (option.choices.length - 1) : 1;

  const toggle = (id: string, checked: boolean) => {
    if (option.selection === "single") onChange([id]);
    else onChange(checked ? [...selected, id] : selected.filter((s) => s !== id));
  };

  return (
    <fieldset
      data-option-group={option.id}
      aria-describedby={error ? errorId : undefined}
      className="scroll-mt-4 border-t border-line pt-5"
    >
      <legend className="flex w-full items-center justify-between gap-3 text-base font-bold">
        <span>{option.name}</span>
        <span
          className={cn(
            "rounded-sm px-2 py-0.5 text-xs font-semibold",
            option.required ? (error ? "bg-danger-tint text-danger" : "bg-ink text-cream") : "bg-cream-deep text-ink-soft"
          )}
        >
          {groupHint(option)}
        </span>
      </legend>
      {error && (
        <p id={errorId} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-danger">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className={cn("mt-3", isSize ? "grid grid-cols-3 gap-2" : "flex flex-col gap-2")}>
        {option.choices.map((choice, index) => {
          const checked = selected.includes(choice.id);
          const available = isChoiceAvailable(choice);
          const disabled = !available || (!checked && atMax);
          const thumb = choice.productId ? productImages.get(choice.productId) : undefined;
          const inputType = option.selection === "single" ? "radio" : "checkbox";
          const priceLabel =
            option.kind === "size"
              ? formatPrice(product.price + choice.priceDelta - (product.bundleDiscount ?? 0))
              : choice.priceDelta > 0
                ? `+ ${formatPrice(choice.priceDelta)}`
                : null;

          return (
            <label
              key={choice.id}
              className={cn(
                "relative flex cursor-pointer items-center rounded-md border bg-surface transition-[border-color,background-color,box-shadow] duration-150",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
                checked ? "border-ink ring-1 ring-ink ring-inset" : "border-line-strong hover:border-ink-muted",
                disabled && "cursor-not-allowed opacity-50",
                isSize ? "min-h-24 flex-col justify-end gap-0.5 px-2 pt-2.5 pb-2 text-center" : "min-h-13 gap-3 px-3.5 py-2"
              )}
            >
              <input
                type={inputType}
                name={name}
                value={choice.id}
                checked={checked}
                disabled={disabled}
                onChange={(event) => toggle(choice.id, event.target.checked)}
                className="sr-only"
              />
              {isSize && (
                <span aria-hidden="true" className="mb-1 flex h-8 items-end justify-center">
                  <span
                    className={cn(
                      "block rounded-full border-2 transition-colors",
                      checked ? "border-ink bg-mustard-tint" : "border-line-strong bg-cream"
                    )}
                    style={{ width: `${2 * glyphScale(index)}rem`, height: `${2 * glyphScale(index)}rem` }}
                  />
                </span>
              )}
              {!isSize && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center border-2 transition-colors",
                    inputType === "radio" ? "rounded-full" : "rounded-sm",
                    checked ? "border-ink bg-ink text-cream" : "border-line-strong bg-surface"
                  )}
                >
                  {checked &&
                    (inputType === "radio" ? (
                      <span className="size-2 rounded-full bg-cream" />
                    ) : (
                      <Check className="size-3.5" strokeWidth={3} />
                    ))}
                </span>
              )}
              {thumb && !isSize && (
                <Image src={thumb} alt="" width={40} height={40} className="size-10 shrink-0 rounded-sm object-cover" />
              )}
              <span className={cn("text-sm font-semibold text-ink", !isSize && "flex-1")}>
                {choice.label}
                {!available && <span className="ms-1.5 text-xs font-normal text-ink-muted">(غير متوفر)</span>}
              </span>
              {priceLabel && (
                <span className={cn("tabular text-sm", isSize ? "font-bold text-ink" : "font-medium text-ink-muted")}>
                  {priceLabel}
                </span>
              )}
              {isSize && (
                <span className="tabular text-xs text-ink-muted">
                  {choice.priceDelta > baseDelta ? `+ ${formatPrice(choice.priceDelta - baseDelta)}` : "الأساسي"}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
