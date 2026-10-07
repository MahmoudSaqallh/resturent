import Link from "next/link";
import type { HomeContent } from "@/types";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { FoodImage } from "@/components/products/food-image";

/** About preview: image and text at equal weight. */
export function Story({ story }: { story: NonNullable<HomeContent["story"]> }) {
  return (
    <section id="story" aria-labelledby="story-title" className="section-y">
      <div className="container-page grid items-center gap-8 md:grid-cols-2 lg:gap-14">
        <Reveal preset="scale" className="relative aspect-4/3 overflow-hidden rounded-lg">
          <FoodImage src={story.image.src} alt={story.image.alt} fill sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw" />
        </Reveal>
        <Reveal selector="[data-reveal-item]">
          <p data-reveal-item className="text-sm font-semibold text-brand-ink">
            عن المطعم
          </p>
          <h2 id="story-title" data-reveal-item className="mt-2 text-section font-extrabold">
            {story.title}
          </h2>
          <div className="mt-4 flex max-w-lg flex-col gap-3 text-ink-soft md:text-lg">
            {story.paragraphs.slice(0, 2).map((paragraph) => (
              <p key={paragraph} data-reveal-item>
                {paragraph}
              </p>
            ))}
          </div>
          <div data-reveal-item>
            <Link href="#contact" className={buttonClasses({ variant: "outline", size: "lg", className: "mt-7 px-6" })}>
              تعال زورنا
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
