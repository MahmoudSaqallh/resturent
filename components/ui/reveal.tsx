"use client";

import { useRef, type ReactNode } from "react";
import { useViewportReveal, type RevealPreset } from "@/lib/use-viewport-reveal";

/** Reveals a block (or its `selector` children) when it scrolls into view. */
export function Reveal({
  children,
  className,
  selector,
  preset,
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger these children instead of the whole block. */
  selector?: string;
  preset?: RevealPreset;
  as?: "div" | "section";
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useViewportReveal(ref, { selector, preset });
  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
