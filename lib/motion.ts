"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Motion tokens. Important events (hero, drawers) get the longer
 * durations; feedback on small controls stays under 300ms.
 */
export const DURATION = {
  micro: 0.16,
  fast: 0.22,
  base: 0.32,
  slow: 0.5,
  hero: 0.8,
} as const;

export const EASE = {
  out: "power3.out",
  soft: "power2.out",
  in: "power2.in",
  inOut: "power2.inOut",
} as const;

export const NO_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const MOTION_OK_QUERY = "(prefers-reduced-motion: no-preference)";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(NO_MOTION_QUERY).matches;
}

export { gsap, useGSAP };
