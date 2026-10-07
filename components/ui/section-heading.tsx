import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
  tone?: "default" | "light";
  as?: "h1" | "h2";
  children?: ReactNode;
  className?: string;
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  link,
  tone = "default",
  as: Tag = "h2",
  children,
  className,
}: SectionHeadingProps) {
  const light = tone === "light";
  return (
    <div data-reveal-heading className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <p className={cn("mb-1.5 text-sm font-bold", light ? "text-mustard" : "text-brand-ink")}>{eyebrow}</p>
        )}
        <Tag id={id} className={cn("text-2xl font-extrabold md:text-3xl", light ? "text-white" : "text-ink")}>
          {title}
        </Tag>
        {description && (
          <p className={cn("mt-2 text-sm md:text-base", light ? "text-white/70" : "text-ink-muted")}>{description}</p>
        )}
      </div>
      {link && (
        <Link
          href={link.href}
          className={cn(
            "group inline-flex h-11 items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline",
            light ? "text-white" : "text-ink"
          )}
        >
          {link.label}
          <ArrowLeft className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
      {children}
    </div>
  );
}
