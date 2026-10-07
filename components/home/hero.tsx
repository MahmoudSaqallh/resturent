"use client";

import Link from "next/link";
import { getImageProps } from "next/image";
import { useRef } from "react";
import { BookOpen, ShoppingBag } from "lucide-react";
import type { HomeContent } from "@/types";
import { cn } from "@/lib/cn";
import { gsap, MOTION_OK_QUERY, useGSAP } from "@/lib/motion";
import { MENU_PATH, menuHref } from "@/features/menu/menu-url";
import { StatusPill } from "@/components/layout/restaurant-status";

/** Sets `highlight` (first occurrence) in the accent colour. */
function Highlighted({ text, highlight }: { text: string; highlight?: string }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-mustard">{highlight}</span>
      {text.slice(at + highlight.length)}
    </>
  );
}

/** Film grain over the photo: hides gradient banding on dark tones and adds tactile depth. */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

// No transition on `transform`: GSAP tweens these in, and a CSS transform transition would fight it.
const cta =
  "group inline-flex h-13 items-center justify-center gap-2.5 rounded-[0.75rem] px-4 text-base sm:px-7 font-bold whitespace-nowrap transition-[background-color,border-color,box-shadow] duration-200 active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-mustard";

/**
 * Campaign hero. A full-width, art-directed photo carries the composition:
 * the food is the focal point on one side and the copy sits in the quiet,
 * dark side of the frame (right on desktop, top on phones). Overlays only
 * shape light for readability; nothing is boxed or floated over the food.
 */
export function Hero({ content }: { content: HomeContent["hero"] }) {
  const root = useRef<HTMLElement>(null);

  // Art direction: wide frame from 1280px, mid frame 1024–1279px, tall frame below.
  // The photo covers the hero by height, so it can render wider than the viewport; sizes says so.
  const SIZES = { wide: "max(100vw, 1850px)", mid: "max(100vw, 1390px)", tall: "max(100vw, 34rem)" };
  const common = { alt: content.image.alt, quality: 75, fetchPriority: "high" as const, loading: "eager" as const };
  const { srcSet: wideSet } = getImageProps({ ...common, ...content.image.wide, sizes: SIZES.wide }).props;
  const { srcSet: midSet } = getImageProps({ ...common, ...content.image.mid, sizes: SIZES.mid }).props;
  const { props: tallProps } = getImageProps({ ...common, ...content.image.tall, sizes: SIZES.tall });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.set("[data-hero-reveal]", { visibility: "visible" });
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          // 1. The photo slowly comes up out of the dark: a curtain lifts while the frame settles.
          //    The image itself is painted from the first frame, so it counts for LCP immediately.
          .to("[data-hero-curtain]", { autoAlpha: 0, duration: 1.4, ease: "power2.out" })
          .from("[data-hero-photo]", { scale: 1.05, duration: 1.6, ease: "power2.out" }, 0)
          // 2. Label, then the headline rises out of its line masks.
          .from("[data-hero-reveal='rule']", { scaleX: 0, duration: 0.6, ease: "power2.inOut" }, 0.3)
          .from("[data-hero-reveal='eyebrow']", { autoAlpha: 0, duration: 0.5 }, 0.4)
          .from("[data-hero-reveal='line']", { yPercent: 110, duration: 0.9, stagger: 0.1, ease: "power4.out" }, 0.45)
          // 3. Supporting copy, 4. actions, 5. the brand sign-off.
          .from("[data-hero-reveal='copy']", { autoAlpha: 0, y: 14, duration: 0.6 }, 0.85)
          .from("[data-hero-reveal='cta'] > *", { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.08 }, 1)
          .from("[data-hero-reveal='brand']", { autoAlpha: 0, duration: 0.6 }, 1.2)
          .from("[data-hero-reveal='note']", { clipPath: "inset(0 0 0 100%)", duration: 0.8, ease: "power2.inOut", clearProps: "clipPath" }, 1.25);
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-char text-cream"
    >
      {/* Background: photo + light shaping + grain. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <picture data-hero-photo className="absolute inset-0 block">
          <source media="(min-width: 1280px)" srcSet={wideSet} sizes={SIZES.wide} />
          <source media="(min-width: 1024px)" srcSet={midSet} sizes={SIZES.mid} />
          <img
            {...tallProps}
            alt=""
            className="absolute inset-0 size-full object-cover object-bottom lg:object-[0%_100%]"
          />
        </picture>
        {/* Phones/tablets: calm the top for the copy, the bottom for the status line. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(17_15_14/0.55),transparent_42%,transparent_78%,rgb(17_15_14/0.55))] lg:hidden" />
        {/* Desktop: deepen the copy side (right) and add a soft vignette that keeps the eye on the food. */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_left,rgb(17_15_14/0.6),rgb(17_15_14/0.25)_38%,transparent_62%)] lg:block" />
        <div className="absolute inset-0 hidden bg-[radial-gradient(110%_95%_at_32%_62%,transparent_50%,rgb(10_9_8/0.5))] lg:block" />
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
        {/* Intro curtain: opaque only while the intro may run (see globals.css). */}
        <div data-hero-curtain className="absolute inset-0 bg-char opacity-0" />
      </div>

      <div className="container-page flex h-[min(calc(100svh-var(--header-h)),46rem)] min-h-[37rem] flex-col pt-9 pb-6 md:h-[54rem] md:pt-14 lg:h-[clamp(38rem,calc(100svh-var(--header-h)),45rem)] lg:flex-row lg:items-center lg:py-16">
        {/* Copy column: RTL start (right), in the dark half of the frame. */}
        <div className="max-w-[34rem] md:max-w-xl lg:max-w-[33rem]">
          <p className="flex items-center gap-3 text-sm font-semibold text-mustard md:text-[0.9375rem]">
            <span data-hero-reveal="rule" aria-hidden="true" className="h-px w-8 origin-right bg-mustard/70" />
            <span data-hero-reveal="eyebrow">{content.eyebrow}</span>
          </p>

          <h1 id="hero-title" className="mt-4 text-hero font-extrabold tracking-[-0.01em] md:mt-5">
            {content.title.map((line, index) => (
              // Mask per line; padding keeps Arabic ascenders/descenders inside it.
              <span key={line} className="-my-[0.08em] block overflow-hidden py-[0.08em]">
                <span data-hero-reveal="line" className="block">
                  <Highlighted text={line} highlight={content.highlight} />
                  {index < content.title.length - 1 && " "}
                </span>
              </span>
            ))}
          </h1>

          <p
            data-hero-reveal="copy"
            className="mt-5 max-w-[26rem] text-base leading-relaxed text-cream/80 md:mt-6 md:text-lg"
          >
            {content.supporting}
          </p>

          <div data-hero-reveal="cta" className="mt-7 grid grid-cols-2 gap-3 sm:flex md:mt-9">
            <Link
              href={menuHref("burgers")}
              className={cn(
                cta,
                "bg-brand text-white shadow-[0_12px_28px_-14px_rgb(217_58_22/0.9)] hover:bg-brand-hover hover:shadow-[0_14px_32px_-14px_rgb(217_58_22/1)]"
              )}
            >
              <ShoppingBag
                className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              />
              اطلب الآن
            </Link>
            <Link
              href={MENU_PATH}
              className={cn(cta, "border border-white/25 text-cream hover:border-white/60 hover:bg-white/[0.07]")}
            >
              <BookOpen className="size-5" aria-hidden="true" />
              تصفح المنيو
            </Link>
          </div>

          {/* Brand line, desktop: live status + a hand-lettered sign-off. */}
          <div data-hero-reveal="brand" className="mt-10 hidden items-center gap-4 lg:flex">
            <StatusPill tone="light" />
            {content.note && (
              <>
                <span aria-hidden="true" className="h-4 w-px bg-white/20" />
                <p data-hero-reveal="note" className="font-hand text-lg text-cream/70">
                  {content.note}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Phones/tablets: status sits on the board at the bottom, clear of the food. */}
        <div data-hero-reveal="brand" className="mt-auto lg:hidden">
          <StatusPill tone="light" />
        </div>
      </div>
    </section>
  );
}
