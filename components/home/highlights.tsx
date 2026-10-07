import { Flame, Layers, MousePointerClick, Timer, type LucideIcon } from "lucide-react";
import type { HighlightIcon, HomeContent } from "@/types";

const ICONS: Record<HighlightIcon, LucideIcon> = { flame: Flame, layers: Layers, pointer: MousePointerClick, timer: Timer };

/** Trust row: icon, short title, one line; thin dividers, no cards. */
export function Highlights({ items }: { items: HomeContent["highlights"] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="why-title" className="section-y">
      <div className="container-page">
        <h2 id="why-title" className="sr-only">
          ليش تختارنا؟
        </h2>
        <ul className="grid gap-y-6 border-y border-line py-8 sm:grid-cols-2 lg:grid-cols-4 lg:py-10">
          {items.map(({ icon, title, text }) => {
            const Icon = ICONS[icon];
            return (
              <li key={title} className="flex gap-3 lg:px-6 lg:first:ps-0 lg:last:pe-0 lg:not-first:border-s lg:not-first:border-line">
                <Icon className="mt-0.5 size-5 shrink-0 text-brand" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-0.5 text-sm text-ink-muted">{text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
