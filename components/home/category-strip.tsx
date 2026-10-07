import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Category } from "@/types";
import { MENU_PATH, menuHref } from "@/features/menu/menu-url";

const SHORT: Partial<Record<Category["id"], string>> = { "cold-drinks": "مشروبات" };

/** Five equal, compact shortcuts into /menu?category=… (not the menu itself). */
export function CategoryStrip({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <nav aria-labelledby="shortcuts-title" className="section-y">
      <div className="container-page">
        <div className="flex items-center justify-between gap-4">
          <h2 id="shortcuts-title" className="text-base font-bold">
            تصفّح حسب القسم
          </h2>
          <Link href={MENU_PATH} className="inline-flex h-11 items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline">
            كل القائمة
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="scrollbar-none relative -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
          {categories.map((category) => (
            <li key={category.id} className="w-40 shrink-0 md:w-auto">
              <Link
                href={menuHref(category.id)}
                className="group flex h-full items-center gap-3 rounded-lg border border-line bg-surface p-2.5 transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-card"
              >
                <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-cream-deep">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">{SHORT[category.id] ?? category.name}</span>
                <ArrowLeft
                  className="size-4 shrink-0 text-ink-muted transition-transform duration-150 group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
