"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, ChefHat, CircleCheck, CircleSlash, Users } from "lucide-react";
import type { Product, Selections } from "@/types";
import { cn } from "@/lib/cn";
import { useCatalog } from "@/features/menu/catalog";
import { cartStore, addToCart, updateLine } from "@/features/cart/store";
import {
  getMissingRequired,
  getStartingPrice,
  getUnitPrice,
  getVariantImage,
  MAX_NOTE_LENGTH,
  withDefaults,
} from "@/features/cart/pricing";
import { notifyAdded } from "@/features/cart/actions";
import { showToast } from "@/features/toasts/store";
import { Badge, getPrimaryBadge, SpicyIndicator } from "@/components/ui/badges";
import { describeAvailableTimes } from "@/features/menu/availability";
import { Price, AnimatedPrice } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { OptionGroup } from "./option-group";
import { restaurant } from "@/data/restaurant";
import { saveMeal, useIsMealSaved } from "@/features/saved-meals/store";
import { ShareMenu } from "@/components/ui/share-menu";
import { PairingList } from "./pairing-list";
import { ProductFacts } from "./product-facts";

interface ProductConfiguratorProps {
  product: Product;
  /** Editing an existing cart line. */
  lineId?: string;
  titleId: string;
  /** Called after a successful add/save (e.g. to close the sheet). */
  onDone?: () => void;
  headingLevel?: "h1" | "h2";
  className?: string;
  /** Called with the chosen variation's real photo (or undefined for the default). */
  onVariantImage?: (src: string | undefined) => void;
}

function initialState(product: Product, lineId?: string) {
  const line = lineId ? cartStore.getState().items.find((item) => item.id === lineId) : undefined;
  return {
    selections: line ? withDefaults(product, line.selections) : withDefaults(product),
    quantity: line?.quantity ?? 1,
    note: line?.note ?? "",
  };
}

export function ProductConfigurator({
  product,
  lineId,
  titleId,
  onDone,
  headingLevel: Heading = "h2",
  className,
  onVariantImage,
}: ProductConfiguratorProps) {
  const { products } = useCatalog();
  const [initial] = useState(() => initialState(product, lineId));
  const [selections, setSelections] = useState<Selections>(initial.selections);
  const changeSelections = (next: Selections) => {
    setSelections(next);
    onVariantImage?.(getVariantImage(product, next));
  };
  // Editing a cart line may start on a variation with its own photo.
  useEffect(() => {
    onVariantImage?.(getVariantImage(product, initial.selections));
  }, [onVariantImage, product, initial.selections]);
  const [quantity, setQuantity] = useState(initial.quantity);
  const [note, setNote] = useState(initial.note);
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const editing = Boolean(lineId);
  const badge = getPrimaryBadge(product);
  const starting = getStartingPrice(product);
  const unitPrice = getUnitPrice(product, selections);
  const missing = getMissingRequired(product, selections);
  const productImages = useMemo(() => new Map(products.map((p) => [p.id, p.image])), [products]);

  /** Points the customer at the first required choice that is still missing. */
  const submitAttempt = () => {
    setAttempted(true);
    const group = formRef.current?.querySelector<HTMLElement>(`[data-option-group="${missing[0].id}"]`);
    group?.scrollIntoView({ behavior: "smooth", block: "center" });
    group?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus({ preventScroll: true });
  };

  const submit = () => {
    if (!product.available) return;
    if (missing.length > 0) {
      submitAttempt();
      return;
    }
    const input = { productId: product.id, selections, quantity, note };
    if (lineId) updateLine(lineId, input);
    else addToCart(input);
    notifyAdded(product.name, editing);
    if (onDone) onDone();
    else {
      setQuantity(1);
      setNote("");
    }
  };

  const saved = useIsMealSaved(product.id, selections, note);
  const canSave = product.available && !editing && (Boolean(product.options?.length) || note.trim().length > 0);
  const saveAsFavorite = () => {
    if (missing.length > 0) {
      submitAttempt();
      return;
    }
    saveMeal({ name: product.name, productId: product.id, selections, note });
    showToast("حُفظت في «وجباتي المفضلة»", { tone: "info" });
  };

  return (
    <div ref={formRef} className={cn("flex flex-col", className)}>
      <div className="flex-1 px-4 pt-5 pb-6 md:px-7">
        <div className="flex flex-wrap items-center gap-2">
          {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
          <SpicyIndicator level={product.spicyLevel} showLabel />
        </div>
        <div className="mt-2 flex items-start justify-between gap-3">
          <Heading id={titleId} className="text-2xl font-extrabold md:text-3xl">
            {product.name}
          </Heading>
          <ShareMenu
            url={`/product/${product.slug}`}
            title={product.name}
            text={`${product.name} من ${restaurant.name}`}
            label={`مشاركة ${product.name}`}
            className="-me-2 shrink-0"
          />
        </div>
        <Price
          amount={starting.amount}
          oldPrice={product.oldPrice}
          isFrom={starting.isFrom}
          size="xl"
          className="mt-1"
        />

        <p className="mt-3 leading-relaxed text-ink-soft">{product.longDescription ?? product.description}</p>

        {product.includes && (
          <ul className="mt-4 flex flex-col gap-1.5" aria-label="يشمل العرض">
            {product.includes.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                <span className="tabular inline-flex h-6 min-w-8 items-center justify-center rounded-sm bg-cream-deep px-1.5 text-xs font-bold">
                  ×{item.quantity}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        )}

        {product.ingredients && product.ingredients.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-bold text-ink">المكونات</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {product.ingredients.map((ingredient) => (
                <li key={ingredient} className="rounded-sm bg-cream-deep px-2.5 py-1 text-xs font-medium text-ink-soft">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
        )}

        {product.serves && (
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
            <Users className="size-4 text-brand" aria-hidden="true" />
            يكفي {product.serves === 2 ? "شخصين" : `${product.serves} أشخاص`}
          </p>
        )}

        <ProductFacts product={product} className="mt-5" />

        <div className="mt-5 flex flex-col gap-2 text-sm">
          {product.available ? (
            <p className="flex items-center gap-2 font-medium text-success">
              <CircleCheck className="size-4" aria-hidden="true" />
              {product.stock === "limited" ? "متوفر · كمية محدودة" : "متوفر"}
              {product.availableTimes?.length ? (
                <span className="font-normal text-ink-muted">· يتوفر {describeAvailableTimes(product)}</span>
              ) : null}
            </p>
          ) : (
            <p className="flex items-center gap-2 font-semibold text-danger">
              <CircleSlash className="size-4" aria-hidden="true" />
              غير متوفر حالياً — يمكنك حفظه في المفضلة والعودة لاحقاً.
            </p>
          )}
          {product.prepNote && (
            <p className="flex items-center gap-2 text-ink-muted">
              <ChefHat className="size-4" aria-hidden="true" />
              {product.prepNote}
            </p>
          )}
        </div>

        {product.available && (
          <div className="mt-6 flex flex-col gap-6">
            {(product.options ?? []).map((option) => (
              <OptionGroup
                key={option.id}
                product={product}
                option={option}
                selected={selections[option.id] ?? []}
                onChange={(ids) => changeSelections({ ...selections, [option.id]: ids })}
                error={
                  attempted && missing.some((m) => m.id === option.id) ? `اختر ${option.name.replace(/^اختر\s*/, "")} للمتابعة.` : undefined
                }
                productImages={productImages}
              />
            ))}

            <div className="border-t border-line pt-5">
              <label htmlFor={`${titleId}-note`} className="text-base font-bold">
                ملاحظات على الطلب <span className="text-sm font-normal text-ink-muted">(اختياري)</span>
              </label>
              <textarea
                id={`${titleId}-note`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={MAX_NOTE_LENGTH}
                rows={2}
                placeholder="مثلاً: بدون بصل، الصوص على جنب"
                className="mt-2 w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-3 text-base leading-relaxed placeholder:text-ink-muted/70 focus:border-ink focus:ring-3 focus:ring-ink/10 focus:outline-none"
              />
            </div>

            {canSave && (
              <button
                type="button"
                onClick={saveAsFavorite}
                disabled={saved}
                className="-mt-2 inline-flex h-11 items-center gap-2 self-start text-sm font-semibold text-ink underline-offset-4 hover:underline disabled:text-success disabled:no-underline"
              >
                {saved ? (
                  <BookmarkCheck className="size-4" aria-hidden="true" />
                ) : (
                  <Bookmark className="size-4" aria-hidden="true" />
                )}
                {saved ? "محفوظة في «وجباتي المفضلة»" : "احفظ هذا الاختيار كوجبتي المفضلة"}
              </button>
            )}
          </div>
        )}

        {!editing && <PairingList product={product} className="mt-8" />}
      </div>

      <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-line bg-cream px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:px-7">
        {product.available && (
          <QuantityStepper value={quantity} onChange={setQuantity} size="md" itemLabel={product.name} />
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!product.available}
          className="inline-flex h-12 min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-brand px-4 text-base font-bold text-white transition-[background-color,transform] duration-150 hover:bg-brand-hover active:scale-98 disabled:bg-ink-muted sm:px-5"
        >
          {product.available ? (
            <>
              <span className="truncate">{editing ? "حفظ التعديلات" : "إضافة إلى السلة"}</span>
              <AnimatedPrice amount={unitPrice * quantity} className="shrink-0 font-extrabold whitespace-nowrap" />
            </>
          ) : (
            <span className="mx-auto">غير متوفر حالياً</span>
          )}
        </button>
      </div>
    </div>
  );
}
