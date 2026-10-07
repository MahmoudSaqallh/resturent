"use client";

import { useRef } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/cn";
import { useIsFavorite } from "@/features/favorites/store";
import { toggleFavoriteWithToast } from "@/features/cart/actions";
import { gsap, prefersReducedMotion } from "@/lib/motion";

interface FavoriteButtonProps {
  product: Product;
  size?: "sm" | "md";
  tone?: "overlay" | "plain";
  className?: string;
}

export function FavoriteButton({ product, size = "md", tone = "overlay", className }: FavoriteButtonProps) {
  const isFavorite = useIsFavorite(product.id);
  const iconRef = useRef<SVGSVGElement>(null);

  const onClick = () => {
    const added = toggleFavoriteWithToast(product);
    if (added && iconRef.current && !prefersReducedMotion()) {
      gsap.fromTo(
        iconRef.current,
        { scale: 0.85 },
        { scale: 1, duration: 0.2, ease: "power2.out", clearProps: "transform" }
      );
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      // Toggle buttons keep a constant name; aria-pressed conveys the state.
      aria-pressed={isFavorite}
      aria-label={`حفظ ${product.name} في المفضلة`}
      className={cn(
        // Callers position it (absolute over a photo); z-10 keeps it above stretched card links.
        "group/fav z-10 inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-150 active:scale-90",
        size === "sm" ? "size-11" : "size-12",
        tone === "overlay" ? "bg-white/95 shadow-card hover:bg-white" : "hover:bg-ink/6",
        className
      )}
    >
      <Heart
        ref={iconRef}
        className={cn(
          "size-5 transition-colors duration-150",
          isFavorite ? "fill-brand text-brand" : "text-ink"
        )}
        strokeWidth={2.25}
        aria-hidden="true"
      />
      {/* Visual tooltip on hover (pointer devices) and keyboard focus; the name comes from aria-label. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-0 top-full z-20 mt-1.5 rounded-sm bg-ink px-2 py-1 text-xs font-semibold whitespace-nowrap text-cream opacity-0 transition-opacity duration-150 group-focus-visible/fav:opacity-100 group-hover/fav:opacity-100"
      >
        {isFavorite ? "محفوظة في المفضلة" : "حفظ في المفضلة"}
      </span>
    </button>
  );
}
