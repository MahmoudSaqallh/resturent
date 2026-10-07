"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { ITEM_FORMS, pluralize } from "@/lib/format";
import { useHydrated } from "@/lib/store";
import { useCartCount } from "@/features/cart/use-cart";
import { MENU_PATH } from "@/features/menu/menu-url";
import { openCart } from "@/features/ui/overlays";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/** Compact closing banner. The cart action only appears when the cart has items. */
export function FinalCta({ image }: { image: string }) {
  const hydrated = useHydrated();
  const count = useCartCount();
  const showCart = hydrated && count > 0;

  return (
    <section aria-labelledby="final-cta-title" className="section-y">
      <div className="container-page">
        <Reveal className="flex flex-col gap-6 rounded-lg bg-ink p-6 text-cream md:flex-row md:items-center md:p-8">
          <div className="relative hidden size-20 shrink-0 overflow-hidden rounded-md md:block">
            <Image src={image} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <div className="flex-1">
            <h2 id="final-cta-title" className="text-2xl font-extrabold md:text-3xl">
              جاهز تطلب؟
            </h2>
            <p className="mt-1 text-cream/75">اختار وجبتك وخلّي الباقي علينا.</p>
          </div>
          <div className="grid gap-3 sm:flex">
            <Link href={MENU_PATH} className={buttonClasses({ variant: "primary", size: "lg", className: "px-7" })}>
              استعرض القائمة
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
            {showCart && (
              <button type="button" onClick={openCart} className={buttonClasses({ variant: "outline-light", size: "lg" })}>
                <ShoppingBag className="size-4" aria-hidden="true" />
                عرض السلة
                <span className="text-sm font-normal text-cream/75">({pluralize(count, ITEM_FORMS)})</span>
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
