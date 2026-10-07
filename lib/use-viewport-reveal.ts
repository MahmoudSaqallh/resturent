"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import { EASE, gsap, prefersReducedMotion, useGSAP } from "./motion";

export type RevealPreset = "rise" | "scale" | "mask";

/** One motion language, three entrances: lists rise, photos settle, bands unmask. */
const PRESETS: Record<RevealPreset, { from: gsap.TweenVars; to: gsap.TweenVars; duration: number }> = {
  rise: { from: { opacity: 0, y: 16 }, to: { opacity: 1, y: 0 }, duration: 0.5 },
  scale: { from: { opacity: 0, scale: 0.96 }, to: { opacity: 1, scale: 1 }, duration: 0.6 },
  mask: {
    from: { clipPath: "inset(10% 6% 10% 6% round 20px)", opacity: 0.4 },
    to: { clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1 },
    duration: 0.85,
  },
};

interface RevealOptions {
  /** Children to reveal; defaults to the scope element itself. */
  selector?: string;
  /** Re-run when this changes (e.g. the active category). */
  revealKey?: string;
  preset?: RevealPreset;
  stagger?: number;
}

/**
 * Reveals elements as they enter the viewport (IntersectionObserver, so
 * no ScrollTrigger in the bundle). Elements already on screen at first
 * render are left alone to avoid a flash; when `revealKey` changes, the
 * visible ones get a short stagger so the content change reads clearly.
 */
export function useViewportReveal(scope: RefObject<HTMLElement | null>, options: RevealOptions = {}) {
  const { selector, revealKey, preset = "rise", stagger = 0.03 } = options;
  const firstRun = useRef(true);

  useGSAP(
    (_context, contextSafe) => {
      const root = scope.current;
      const isFirst = firstRun.current;
      firstRun.current = false;
      if (!root || prefersReducedMotion() || !contextSafe) return;

      const { from, to, duration } = PRESETS[preset];
      const clear = "opacity,transform,clipPath";
      const targets = selector ? gsap.utils.toArray<HTMLElement>(selector, root) : [root];
      const viewport = window.innerHeight;
      const visible: HTMLElement[] = [];
      const below: HTMLElement[] = [];
      for (const el of targets) {
        const rect = el.getBoundingClientRect();
        if (rect.top >= viewport) below.push(el);
        else if (rect.bottom > 0) visible.push(el);
      }

      if (!isFirst && visible.length > 0) {
        gsap.fromTo(
          visible.slice(0, 12),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: EASE.soft, clearProps: clear }
        );
      }
      if (below.length === 0) return;

      gsap.set(below, from);
      const reveal = contextSafe((batch: Element[]) => {
        gsap.to(batch, { ...to, duration, stagger, ease: preset === "mask" ? "power3.inOut" : EASE.out, clearProps: clear });
      });
      const observer = new IntersectionObserver(
        (entries) => {
          const batch = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
          if (batch.length === 0) return;
          batch.forEach((el) => observer.unobserve(el));
          reveal(batch);
        },
        { rootMargin: "0px 0px -8% 0px" }
      );
      below.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    },
    { scope, dependencies: [revealKey, preset], revertOnUpdate: true }
  );
}
