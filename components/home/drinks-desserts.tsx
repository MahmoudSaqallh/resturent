import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { HomeContent } from "@/types";
import { menuHref } from "@/features/menu/menu-url";
import { Reveal } from "@/components/ui/reveal";
import { FoodImage } from "@/components/products/food-image";

/** Two equal blocks into their menu categories. */
export function DrinksDesserts({ blocks }: { blocks: HomeContent["pair"] }) {
  if (blocks.length === 0) return null;
  return (
    <section aria-label="المشروبات والحلويات" className="section-y">
      <Reveal selector="[data-block]" className="container-page grid gap-5 md:grid-cols-2">
        {blocks.map((block) => (
          <Link
            key={block.categoryId}
            href={menuHref(block.categoryId)}
            data-block
            className="group overflow-hidden rounded-lg border border-line bg-surface transition-shadow duration-200 hover:shadow-raised"
          >
            <div className="relative aspect-3/2 overflow-hidden">
              <FoodImage
                src={block.image.src}
                alt={block.image.alt}
                fill
                sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
                imageClassName="transition-transform duration-500 ease-out-soft group-hover:scale-103"
              />
            </div>
            <div className="flex items-end justify-between gap-4 p-5 md:p-6">
              <div>
                <h3 className="text-2xl font-extrabold">{block.title}</h3>
                <p className="mt-1 text-ink-muted">{block.text}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-ink">
                استكشف
                <ArrowLeft className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}
