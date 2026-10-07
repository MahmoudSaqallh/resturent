"use client";

import { useEffect, useRef } from "react";
import type { Category } from "@/types";
import { cn } from "@/lib/cn";
import type { MenuCategory } from "@/features/menu/menu-url";
import { CategoryIcon } from "@/components/ui/category-icon";

interface CategoryBarProps {
  categories: Category[];
  active: MenuCategory;
  onSelect: (category: MenuCategory) => void;
  label?: string;
}

/** Compact icon + label chips; scrolls horizontally on small screens. */
export function CategoryBar({ categories, active, onSelect, label = "أقسام القائمة" }: CategoryBarProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the active chip visible inside the horizontal scroller.
  useEffect(() => {
    const list = listRef.current;
    const chip = list?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!list || !chip) return;
    const listRect = list.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    if (chipRect.left < listRect.left + 16 || chipRect.right > listRect.right - 16) {
      const offset = chipRect.left - listRect.left - (listRect.width - chipRect.width) / 2;
      list.scrollBy({ left: offset, behavior: "smooth" });
    }
  }, [active]);

  const items: { id: MenuCategory; name: string; icon: Category["icon"] | "all" }[] = [
    { id: "all", name: "الكل", icon: "all" },
    ...categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
  ];

  return (
    <nav aria-label={label}>
      <ul ref={listRef} className="scrollbar-none relative -mx-4 flex gap-2 overflow-x-auto px-4 py-2.5 md:-mx-6 md:px-6 xl:mx-0 xl:flex-wrap xl:gap-1.5 xl:px-0">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-200 xl:px-3.5",
                  isActive
                    ? "bg-ink text-cream shadow-card"
                    : "bg-surface text-ink-soft ring-1 ring-line hover:text-ink hover:ring-ink-muted"
                )}
              >
                <CategoryIcon name={item.icon} className={cn("size-4.5", isActive ? "text-mustard" : "text-brand")} />
                {item.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
