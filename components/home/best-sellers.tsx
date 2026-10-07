"use client";

import type { Product } from "@/types";
import { MENU_PATH } from "@/features/menu/menu-url";
import { Reveal } from "@/components/ui/reveal";
import { ProductCard } from "@/components/products/product-card";
import { HomeHeading } from "./home-heading";

/** Four restaurant-picked items, using the same card as the menu. */
export function BestSellers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section id="popular" aria-labelledby="popular-title" className="section-y">
      <div className="container-page">
        <Reveal>
          <HomeHeading
            id="popular-title"
            title="الأكثر طلباً"
            description="الأصناف اللي بيرجعلها زبائننا كل مرة."
            link={{ href: MENU_PATH, label: "شوف كل المنيو" }}
          />
        </Reveal>
        <Reveal selector="[data-card]" className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showBadge={false} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
