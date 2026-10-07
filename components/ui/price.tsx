"use client";

import { useRef } from "react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { DURATION, EASE, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

interface PriceProps {
  amount: number;
  oldPrice?: number;
  isFrom?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  tone?: "default" | "light";
}

const sizeClass = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
};

/** Price with optional "ابتداءً من" prefix and struck-through old price. */
export function Price({ amount, oldPrice, isFrom, size = "md", className, tone = "default" }: PriceProps) {
  const showOld = oldPrice !== undefined && oldPrice > amount;
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-1.5", className)}>
      {isFrom && (
        <span className={cn("text-xs font-normal", tone === "light" ? "text-white/70" : "text-ink-muted")}>
          ابتداءً من
        </span>
      )}
      <span className={cn("tabular font-bold", sizeClass[size], tone === "light" ? "text-white" : "text-ink")}>
        {formatPrice(amount)}
      </span>
      {showOld && (
        <s className={cn("tabular text-sm", tone === "light" ? "text-white/60" : "text-ink-muted")}>
          <span className="sr-only">بدلاً من </span>
          {formatPrice(oldPrice)}
        </s>
      )}
    </span>
  );
}

/** A price that gives a short, readable cue when its value changes. */
export function AnimatedPrice({ amount, className }: { amount: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      if (!ref.current || prefersReducedMotion()) return;
      gsap.fromTo(
        ref.current,
        { y: 5, opacity: 0.35 },
        { y: 0, opacity: 1, duration: DURATION.fast, ease: EASE.soft, overwrite: true }
      );
    },
    { dependencies: [amount] }
  );

  return (
    <span ref={ref} className={cn("tabular inline-block", className)}>
      {formatPrice(amount)}
    </span>
  );
}
