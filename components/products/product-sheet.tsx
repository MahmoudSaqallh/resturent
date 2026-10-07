"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/types";
import { useCatalog } from "@/features/menu/catalog";
import { closeProduct, useOverlay } from "@/features/ui/overlays";
import { Sheet } from "@/components/ui/sheet";
import { FoodImage } from "./food-image";
import { ProductConfigurator } from "./product-configurator";

const TITLE_ID = "product-sheet-title";

/** Quick-view for any product: bottom sheet on phones, dialog on larger screens. */
export function ProductSheet() {
  const target = useOverlay("product");
  const { productsById } = useCatalog();
  // Keep the last product rendered while the sheet animates out.
  const [shown, setShown] = useState(target);
  if (target && target !== shown) setShown(target);
  const product = shown ? productsById.get(shown.productId) : undefined;

  return (
    <Sheet open={Boolean(target && product)} onClose={closeProduct} variant="modal" labelledBy={TITLE_ID}>
      {product && shown && <SheetBody key={`${product.id}:${shown.nonce}`} product={product} lineId={shown.lineId} />}
    </Sheet>
  );
}

function SheetBody({ product, lineId }: { product: Product; lineId?: string }) {
  const [variantImage, setVariantImage] = useState<string | undefined>();
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain md:flex-row md:overflow-hidden">
      <div className="relative aspect-16/11 shrink-0 md:aspect-auto md:w-[44%]">
        <FoodImage
          src={variantImage ?? product.image}
          alt={product.imageAlt ?? product.name}
          sizes="(min-width: 768px) 420px, 100vw"
          quality={85}
          fill
        />
        <button
          type="button"
          onClick={closeProduct}
          aria-label="إغلاق"
          className="absolute end-3 top-3 inline-flex size-11 items-center justify-center rounded-full bg-white/95 text-ink shadow-card transition-transform active:scale-90"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <ProductConfigurator
        product={product}
        lineId={lineId}
        titleId={TITLE_ID}
        onDone={closeProduct}
        onVariantImage={setVariantImage}
        className="md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain"
      />
    </div>
  );
}
