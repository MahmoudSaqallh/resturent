"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface FoodImageProps {
  src: string;
  alt: string;
  /** Required: tells the browser which width to download. */
  sizes: string;
  /** Absolutely fill the nearest positioned ancestor; otherwise size it with className. */
  fill?: boolean;
  className?: string;
  imageClassName?: string;
  preload?: boolean;
  quality?: 75 | 85;
}

/** Food photo with a shimmer placeholder until it decodes. */
export function FoodImage({ src, alt, sizes, fill, className, imageClassName, preload, quality }: FoodImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={cn(
        fill ? "absolute inset-0" : "relative",
        "overflow-hidden bg-cream-deep",
        !loaded && "skeleton",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        quality={quality}
        onLoad={() => setLoaded(true)}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
