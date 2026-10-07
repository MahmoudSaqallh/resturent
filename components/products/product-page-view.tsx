"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useCatalog } from "@/features/menu/catalog";
import { markViewed } from "@/features/menu/recently-viewed";
import { menuHref } from "@/features/menu/menu-url";
import { FoodImage } from "./food-image";
import { FavoriteButton } from "./favorite-button";
import { ProductConfigurator } from "./product-configurator";

/** Full-page product details (shareable URL); the sheet is the in-menu quick view. */
export function ProductPageView({ productId }: { productId: string }) {
  const { productsById, categoriesById } = useCatalog();
  const product = productsById.get(productId);
  const [variantImage, setVariantImage] = useState<string | undefined>();

  useEffect(() => {
    markViewed(productId);
  }, [productId]);

  if (!product) return null;
  const category = categoriesById.get(product.categoryId);

  return (
    <div className="container-page py-5 md:py-8">
      <nav aria-label="مسار التنقل" className="mb-4 text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-ink-muted">
          <li className="flex items-center gap-1">
            <Link href="/" className="hover:text-ink hover:underline">
              الرئيسية
            </Link>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </li>
          <li className="flex items-center gap-1">
            <Link href={product.categoryId === "offers" ? "/offers" : menuHref(product.categoryId)} className="hover:text-ink hover:underline">
              {category?.name ?? "القائمة"}
            </Link>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </li>
          <li aria-current="page" className="font-semibold text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-2 md:grid-cols-2 md:gap-10 lg:gap-14">
        <div className="relative md:sticky md:top-[calc(var(--header-h)+1.5rem)] md:self-start">
          <FoodImage
            src={variantImage ?? product.image}
            alt={product.imageAlt ?? product.name}
            sizes="(min-width: 768px) 50vw, 100vw"
            preload
            quality={85}
            className="aspect-4/3 w-full rounded-xl"
          />
          <FavoriteButton product={product} className="absolute end-3 top-3" />
        </div>
        <ProductConfigurator
          product={product}
          titleId="product-title"
          headingLevel="h1"
          onVariantImage={setVariantImage}
          className="-mx-4 md:mx-0 md:rounded-xl md:bg-surface md:ring-1 md:ring-line"
        />
      </div>
    </div>
  );
}
