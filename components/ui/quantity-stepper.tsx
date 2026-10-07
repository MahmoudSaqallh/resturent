"use client";

import { Minus, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/cn";
import { MAX_LINE_QUANTITY } from "@/features/cart/pricing";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** When set, the minus button turns into "remove" at quantity 1. */
  onRemove?: () => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  /** Used in labels, e.g. the product name. */
  itemLabel?: string;
  tone?: "default" | "brand";
  className?: string;
}

const sizes = {
  sm: { wrap: "h-11", btn: "size-11", icon: "size-4", value: "w-6 text-sm" },
  md: { wrap: "h-11", btn: "size-11", icon: "size-4", value: "w-8 text-base" },
  lg: { wrap: "h-13", btn: "size-13", icon: "size-5", value: "w-9 text-lg" },
};

export function QuantityStepper({
  value,
  onChange,
  onRemove,
  min = 1,
  max = MAX_LINE_QUANTITY,
  size = "md",
  itemLabel,
  tone = "default",
  className,
}: QuantityStepperProps) {
  const s = sizes[size];
  const atMin = value <= min;
  const showRemove = Boolean(onRemove) && atMin;
  const suffix = itemLabel ? ` ${itemLabel}` : "";

  const buttonClass = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-150 active:scale-90 disabled:opacity-35",
    s.btn,
    tone === "brand" ? "text-white hover:bg-white/15" : "text-ink hover:bg-ink/8"
  );

  return (
    <div
      role="group"
      aria-label={`الكمية${suffix}`}
      className={cn(
        "inline-flex items-center rounded-full",
        s.wrap,
        tone === "brand" ? "bg-brand text-white" : "border border-line-strong bg-surface",
        className
      )}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`زيادة الكمية${suffix}`}
      >
        <Plus className={s.icon} aria-hidden="true" />
      </button>
      <output aria-live="polite" className={cn("tabular text-center font-bold", s.value)}>
        {value}
      </output>
      {showRemove ? (
        <button type="button" className={buttonClass} onClick={onRemove} aria-label={`إزالة${suffix} من السلة`}>
          <Trash className={s.icon} aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          className={buttonClass}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={atMin}
          aria-label={`إنقاص الكمية${suffix}`}
        >
          <Minus className={s.icon} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
