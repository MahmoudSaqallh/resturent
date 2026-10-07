"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import type { Category, Product } from "@/types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useViewportReveal } from "@/lib/use-viewport-reveal";
import { useCatalog } from "@/features/menu/catalog";
import { searchProducts } from "@/features/menu/search";
import { applyMenuFilters, getMenuFilters, type MenuFilter } from "@/features/menu/filters";
import { matchesPrice, PRICE_RANGES, type PriceRange } from "@/features/menu/discover";
import { cn } from "@/lib/cn";
import { menuHref, parseMenuCategory, type MenuCategory } from "@/features/menu/menu-url";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/products/product-card";
import { CategoryBar } from "./category-bar";

const GRID = "grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4";

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className={GRID}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function CategoryGroup({ category, products }: { category: Category; products: Product[] }) {
  return (
    // Off-screen groups skip rendering until scrolled near (big win on long menus, phones especially).
    <section aria-labelledby={`group-${category.id}`} className="[contain-intrinsic-size:auto_1100px] [content-visibility:auto]">
      <h3 id={`group-${category.id}`} className="mb-4 flex items-center gap-2.5 text-xl font-extrabold">
        <span className="flex size-9 items-center justify-center rounded-md bg-brand-tint text-brand">
          <CategoryIcon name={category.icon} className="size-5" />
        </span>
        {category.name}
        <span className="tabular text-sm font-medium text-ink-muted">({products.length})</span>
      </h3>
      <ProductGrid products={products} />
    </section>
  );
}

const MENU_GRID_ID = "menu-grid";

/** Whether the user has scrolled past the start of the grid. */
function isPastMenuTop() {
  const anchor = document.getElementById(MENU_GRID_ID);
  if (!anchor) return false;
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) * 16 || 64;
  return anchor.getBoundingClientRect().top < header - 1;
}

/**
 * The full menu. The active category lives in the URL (?category=…) so
 * homepage shortcuts, search, back/forward and shared links all land on it.
 */
export function MenuSection() {
  const { menuCategories, menuProducts, categoriesById } = useCatalog();
  const searchParams = useSearchParams();
  const categoryIds = useMemo(() => menuCategories.map((c) => c.id), [menuCategories]);
  const category = parseMenuCategory(searchParams.get("category"), categoryIds);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 200);
  const gridRef = useRef<HTMLDivElement>(null);
  const searching = debounced.trim().length > 0;
  const [filters, setFilters] = useState<ReadonlySet<MenuFilter>>(() => new Set());
  const filterOptions = useMemo(() => getMenuFilters(menuProducts), [menuProducts]);
  const [price, setPrice] = useState<PriceRange>("all");
  const filtered = useMemo(
    () => applyMenuFilters(menuProducts, filters).filter((p) => matchesPrice(p, price)),
    [menuProducts, filters, price]
  );
  const filtering = filters.size > 0 || price !== "all";

  const results = useMemo(
    () => (searching ? searchProducts(filtered, categoriesById, debounced) : []),
    [searching, filtered, categoriesById, debounced]
  );
  const groups = useMemo(
    () =>
      menuCategories
        .map((c) => ({ category: c, products: filtered.filter((p) => p.categoryId === c.id) }))
        .filter((group) => group.products.length > 0),
    [menuCategories, filtered]
  );
  const activeProducts = category === "all" ? null : filtered.filter((product) => product.categoryId === category);
  const visibleCount = activeProducts ? activeProducts.length : filtered.length;

  const toggleFilter = (id: MenuFilter) =>
    setFilters((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const showAll = () => {
    setQuery("");
    setFilters(new Set());
    setPrice("all");
    setCategory("all");
  };

  useViewportReveal(gridRef, {
    selector: "[data-card]",
    revealKey: searching ? `q:${debounced}` : `c:${category}:${[...filters].join(",")}:${price}`,
  });

  // Native history updates are picked up by useSearchParams without a server round-trip.
  const setCategory = (next: MenuCategory) => window.history.replaceState(null, "", menuHref(next));

  const selectCategory = (next: MenuCategory) => {
    if (query) setQuery("");
    setCategory(next);
    if (isPastMenuTop()) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(MENU_GRID_ID)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };

  const onSearch = (value: string) => {
    setQuery(value);
    if (value && category !== "all") setCategory("all");
  };

  return (
    <section aria-labelledby="menu-title" className="pt-8 pb-14 md:pt-10 md:pb-20">
      <div className="container-page">
        <SectionHeading
          as="h1"
          id="menu-title"
          eyebrow="المنيو"
          title="القائمة"
          description="اختر القسم أو ابحث باسم الوجبة أو المكوّن."
        >
          <div role="search" className="relative w-full md:w-80">
            <label htmlFor="menu-search" className="sr-only">
              ابحث في القائمة
            </label>
            <Search
              className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="ابحث عن وجبتك..."
              enterKeyHint="search"
              autoComplete="off"
              className="h-12 w-full rounded-full bg-surface ps-11 pe-11 text-base ring-1 ring-line-strong outline-none placeholder:text-ink-muted/80 focus:ring-2 focus:ring-ink [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="مسح البحث"
                className="absolute end-1.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-ink/6"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </SectionHeading>
      </div>

      {/* Lands the sticky bar right under the header (cancels the html scroll-padding gap). */}
      <div id={MENU_GRID_ID} className="-scroll-mt-3" />
      <div className="sticky top-(--header-h) z-30 mt-5 border-b border-line bg-cream">
        <div className="container-page">
          <CategoryBar
            categories={menuCategories}
            active={searching ? "all" : category}
            onSelect={selectCategory}
          />
        </div>
      </div>

      <div ref={gridRef} className="container-page mt-4">
        {(filterOptions.length > 0 || menuProducts.length > 20) && (
          <div role="group" aria-label="تصفية القائمة" className="relative -mx-4 mb-5 flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
            <SlidersHorizontal className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
            {filterOptions.map((filter) => {
              const on = filters.has(filter.id);
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
                    on ? "bg-ink text-cream" : "bg-surface text-ink-soft ring-1 ring-line hover:ring-ink-muted"
                  )}
                >
                  {on && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                  {filter.label}
                </button>
              );
            })}
            {/* Simple price filter: worth it only on a large menu. */}
            {menuProducts.length > 20 && (
              <>
                <label htmlFor="menu-price" className="sr-only">
                  السعر
                </label>
                <select
                  id="menu-price"
                  value={price}
                  onChange={(event) => setPrice(event.target.value as PriceRange)}
                  className={cn(
                    "h-9 shrink-0 rounded-full border bg-surface px-3 text-sm font-semibold focus:border-ink focus:outline-none",
                    price !== "all" ? "border-ink text-ink" : "border-line text-ink-soft"
                  )}
                >
                  {PRICE_RANGES.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.id === "all" ? "السعر: الكل" : range.label}
                    </option>
                  ))}
                </select>
              </>
            )}
            {filtering && (
              <button
                type="button"
                onClick={() => {
                  setFilters(new Set());
                  setPrice("all");
                }}
                className="inline-flex h-9 shrink-0 items-center px-2 text-sm font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          {searching
            ? results.length
              ? `${results.length} نتيجة للبحث`
              : "ما لقينا وجبة بهالاسم"
            : filtering
              ? `${visibleCount} صنف مطابق`
              : ""}
        </p>
        {searching ? (
          results.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-ink-muted">
                <span className="tabular font-bold text-ink">{results.length}</span> نتيجة لـ «{debounced.trim()}»
              </p>
              <ProductGrid products={results} />
            </>
          ) : (
            <EmptyState
              icon={<SearchX className="size-7" />}
              title="ما لقينا وجبة بهالاسم"
              description={filtering ? "جرّب كلمة أخرى أو امسح الفلاتر." : "جرّب كلمة أخرى، أو تصفّح المنيو كاملاً."}
              action={<Button onClick={showAll}>شوف كل المنيو</Button>}
            />
          )
        ) : visibleCount === 0 ? (
          <EmptyState
            icon={<SlidersHorizontal className="size-7" />}
            title="لا توجد أصناف تطابق اختيارك"
            description="امسح الفلاتر أو اختر قسماً آخر."
            action={<Button onClick={showAll}>شوف كل المنيو</Button>}
          />
        ) : activeProducts ? (
          <ProductGrid products={activeProducts} />
        ) : (
          <div className="flex flex-col gap-12">
            {groups.map((group) => (
              <CategoryGroup key={group.category.id} category={group.category} products={group.products} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
