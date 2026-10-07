import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

interface HomeHeadingProps {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
  className?: string;
}

/** One heading pattern for every homepage section: eyebrow, 30–40px title, short text, optional link. */
export function HomeHeading({ id, eyebrow, title, description, link, className }: HomeHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-3", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="text-sm font-semibold text-brand-ink">{eyebrow}</p>}
        <h2 id={id} className={cn("text-section font-extrabold", eyebrow && "mt-2")}>
          {title}
        </h2>
        {description && <p className="mt-2 text-base text-ink-muted md:text-lg">{description}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="group inline-flex h-11 items-center gap-1.5 text-sm font-bold text-ink underline-offset-4 hover:underline"
        >
          {link.label}
          <ArrowLeft className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
