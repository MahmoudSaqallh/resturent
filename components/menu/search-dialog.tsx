"use client";

import { useMemo, useRef, useState } from "react";
import { History, Search, SearchX, X } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useDelayedFlag } from "@/lib/use-delayed-flag";
import { useCatalog } from "@/features/menu/catalog";
import { searchProducts } from "@/features/menu/search";
import { useRecentlyViewedIds } from "@/features/menu/recently-viewed";
import { useGoToMenu } from "@/features/menu/use-go-to-menu";
import { getStartingPrice, needsConfiguration } from "@/features/cart/pricing";
import { quickAdd } from "@/features/cart/actions";
import { closeSearch, openProduct, useOverlay } from "@/features/ui/overlays";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { FoodImage } from "@/components/products/food-image";

const TITLE_ID = "search-title";

function ResultRow({ product, categoryName }: { product: Product; categoryName?: string }) {
  const { amount, isFrom } = getStartingPrice(product);
  const configurable = needsConfiguration(product);
  return (
    <li className="flex items-center gap-3 px-4 py-2.5 md:px-5">
      <FoodImage src={product.image} alt="" sizes="56px" className="size-14 shrink-0 rounded-md" />
      <button
        type="button"
        onClick={() => openProduct(product.id)}
        className="min-w-0 flex-1 text-start"
      >
        <span className="block truncate text-sm font-bold">{product.name}</span>
        <span className="tabular block truncate text-xs text-ink-muted">
          {categoryName} · {isFrom && "ابتداءً من "}
          {formatPrice(amount)}
          {!product.available && " · غير متوفر حالياً"}
        </span>
      </button>
      {product.available && (
        <button
          type="button"
          onClick={() => (configurable ? openProduct(product.id) : quickAdd(product))}
          className="inline-flex h-10 shrink-0 items-center rounded-full bg-ink px-4 text-sm font-bold text-cream transition-colors hover:bg-brand"
          aria-label={configurable ? `اختر خيارات ${product.name}` : `إضافة ${product.name} إلى السلة`}
        >
          {configurable ? "اختر" : "+ إضافة"}
        </button>
      )}
    </li>
  );
}

export function SearchDialog() {
  const open = useOverlay("searchOpen");
  const { products, categoriesById, menuCategories, productsById, complete, status, ensureComplete } = useCatalog();
  const recentIds = useRecentlyViewedIds();
  const goToMenu = useGoToMenu();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 180);

  const searchable = useMemo(() => products.filter((p) => !p.hidden), [products]);
  const results = useMemo(
    () => searchProducts(searchable, categoriesById, debounced).slice(0, 24),
    [searchable, categoriesById, debounced]
  );
  const recent = recentIds
    .map((id) => productsById.get(id))
    .filter((p): p is Product => Boolean(p && !p.hidden))
    .slice(0, 5);
  const trimmed = debounced.trim();
  const showLoading = useDelayedFlag(!complete && trimmed.length > 0);

  const close = () => {
    closeSearch();
    setQuery("");
  };

  return (
    <Sheet open={open} onClose={close} variant="search" labelledBy={TITLE_ID} initialFocus={inputRef}>
      <h2 id={TITLE_ID} className="sr-only">
        البحث في القائمة
      </h2>
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2.5 md:px-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن وجبتك..."
            aria-label="ابحث عن وجبتك"
            enterKeyHint="search"
            autoComplete="off"
            className="h-12 w-full rounded-full bg-surface ps-11 pe-10 text-base ring-1 ring-line-strong outline-none placeholder:text-ink-muted/80 focus:ring-2 focus:ring-ink [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="مسح البحث"
              className="absolute end-1.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-ink/6"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <button type="button" onClick={close} className="h-11 rounded-full px-3 text-sm font-bold text-ink-soft hover:text-ink">
          إلغاء
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        <p className="sr-only" aria-live="polite">
          {trimmed && complete ? (results.length ? `${results.length} نتيجة` : "ما لقينا وجبة بهالاسم") : ""}
        </p>
        {!trimmed ? (
          <div className="px-4 py-4 md:px-5">
            {recent.length > 0 && (
              <section aria-labelledby="search-recent" className="mb-5">
                <h3 id="search-recent" className="mb-1 flex items-center gap-1.5 text-sm font-bold text-ink-muted">
                  <History className="size-4" aria-hidden="true" />
                  شاهدتها مؤخراً
                </h3>
                <ul className="-mx-4 md:-mx-5">
                  {recent.map((product) => (
                    <ResultRow key={product.id} product={product} categoryName={categoriesById.get(product.categoryId)?.name} />
                  ))}
                </ul>
              </section>
            )}
            <h3 className="mb-2.5 text-sm font-bold text-ink-muted">تصفّح الأقسام</h3>
            <ul className="flex flex-wrap gap-2">
              {menuCategories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => goToMenu(category.id)}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-surface px-3.5 text-sm font-semibold ring-1 ring-line transition-colors hover:ring-ink"
                  >
                    <CategoryIcon name={category.icon} className="size-4 text-brand" />
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : !complete && status === "error" ? (
          <EmptyState
            compact
            icon={<SearchX className="size-7" />}
            title="تعذّر تحميل القائمة"
            description="تأكد من اتصالك بالإنترنت ثم حاول مرة أخرى."
            action={
              <Button variant="outline" onClick={ensureComplete}>
                حاول مرة أخرى
              </Button>
            }
          />
        ) : !complete ? (
          <p className="px-4 py-8 text-center text-sm text-ink-muted md:px-5" aria-busy="true">
            {showLoading ? "جارٍ البحث…" : ""}
          </p>
        ) : results.length === 0 ? (
          <EmptyState
            compact
            icon={<SearchX className="size-7" />}
            title="ما لقينا وجبة بهالاسم"
            description={`لا يوجد ما يطابق "${trimmed}". جرّب كلمة أخرى مثل: برغر، شاورما، عصير.`}
            action={
              <Button
                onClick={() => {
                  setQuery("");
                  goToMenu();
                }}
              >
                شوف كل المنيو
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line py-1">
            {results.map((product) => (
              <ResultRow key={product.id} product={product} categoryName={categoriesById.get(product.categoryId)?.name} />
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
