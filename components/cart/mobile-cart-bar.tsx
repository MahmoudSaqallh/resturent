"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { ShoppingBag } from "lucide-react";
import { ITEM_FORMS, pluralize } from "@/lib/format";
import { useHydrated } from "@/lib/store";
import { DURATION, EASE, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { useCartSummary } from "@/features/cart/use-cart";
import { openCart } from "@/features/ui/overlays";
import { AnimatedPrice } from "@/components/ui/price";

// These pages have their own sticky bottom action bar.
const HIDDEN_ON = ["/checkout", "/product/", "/build-meal"];

/** Phone-only shortcut to the cart; hidden when the cart is empty or where it would clash. */
export function MobileCartBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { itemCount, total, pending } = useCartSummary();
  const barRef = useRef<HTMLDivElement>(null);
  // Waits for prices when the page started with a partial catalog (homepage).
  const visible = hydrated && !pending && itemCount > 0 && !HIDDEN_ON.some((path) => pathname.startsWith(path));

  useGSAP(
    () => {
      if (!visible || !barRef.current || prefersReducedMotion()) return;
      gsap.fromTo(barRef.current, { yPercent: 120 }, { yPercent: 0, duration: DURATION.base, ease: EASE.out });
    },
    { dependencies: [visible] }
  );

  if (!visible) return null;

  return (
    <>
      {/* Keeps the end of the page reachable above the bar. */}
      <div aria-hidden="true" className="h-22 md:hidden" />
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden print:hidden"
      >
        <button
          type="button"
          onClick={openCart}
          className="flex h-14 w-full items-center gap-3 rounded-full bg-brand ps-2 pe-5 text-white shadow-raised transition-transform active:scale-98"
        >
          <span className="relative flex size-10 items-center justify-center rounded-full bg-white/15">
            <ShoppingBag className="size-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-bold">عرض السلة</span>
            <span className="text-xs text-white/85">{pluralize(itemCount, ITEM_FORMS)}</span>
          </span>
          <AnimatedPrice amount={total} className="ms-auto text-lg font-extrabold" />
        </button>
      </div>
    </>
  );
}
