import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { home } from "@/data/home";
import { restaurant } from "@/data/restaurant";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { FoodImage } from "@/components/products/food-image";
import { Highlights } from "@/components/home/highlights";
import { Gallery } from "@/components/home/gallery";
import { VisitPanel } from "@/components/info/visit-panel";

export const metadata: Metadata = {
  title: "عن المطعم",
  description: restaurant.description,
};

export default function AboutPage() {
  const story = home.story;
  const branches = restaurant.branches;

  return (
    <>
      <section aria-labelledby="about-title" className="section-y">
        <div className="container-page grid items-center gap-8 md:grid-cols-2 lg:gap-14">
          <div>
            <p className="text-sm font-semibold text-brand-ink">عن المطعم</p>
            <h1 id="about-title" className="mt-2 text-section font-extrabold">
              {story?.title ?? restaurant.name}
            </h1>
            <div className="mt-4 flex max-w-lg flex-col gap-3 text-ink-soft md:text-lg">
              <p>{restaurant.description}</p>
              {story?.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <Link href="/menu" className={buttonClasses({ size: "lg", className: "mt-7 px-6" })}>
              شوف المنيو
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {story && (
            <Reveal preset="scale" className="relative aspect-4/3 overflow-hidden rounded-lg">
              <FoodImage
                src={story.image.src}
                alt={story.image.alt}
                fill
                preload
                sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
              />
            </Reveal>
          )}
        </div>
      </section>

      <Highlights items={home.highlights} />
      <Gallery images={home.gallery} />

      <section aria-labelledby="visit-title" className="section-y">
        <div className="container-page">
          <h2 id="visit-title" className="text-section font-extrabold">
            {branches.length > 1 ? "فروعنا" : "زورنا"}
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {branches.map((branch) => (
              <VisitPanel key={branch.id} branch={branch} title={branches.length > 1 ? branch.name : undefined} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
