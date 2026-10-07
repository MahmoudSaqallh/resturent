import Link from "next/link";
import type { SVGProps } from "react";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/cn";

export function Logo({ tone = "default", className }: { tone?: "default" | "light"; className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${restaurant.name} — الصفحة الرئيسية`}
      className={cn("inline-flex min-h-11 shrink-0 items-center gap-2", className)}
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-md bg-brand font-display text-xl leading-none font-extrabold text-white"
      >
        ج
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-xl font-extrabold", tone === "light" ? "text-white" : "text-ink")}>
          {restaurant.name}
        </span>
        <span
          className={cn(
            "mt-0.5 text-xs font-semibold tracking-[0.18em]",
            tone === "light" ? "text-white/60" : "text-ink-muted"
          )}
        >
          {restaurant.nameLatin}
        </span>
      </span>
    </Link>
  );
}

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const stroke = (size: number) => ({
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export function InstagramIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...stroke(size)} {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...stroke(size)} {...props}>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

export function FacebookIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...stroke(size)} {...props}>
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />
    </svg>
  );
}

export function TikTokIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...stroke(size)} {...props}>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.4 2.6 2 4.2 5 4.5" />
    </svg>
  );
}

export const contactLinks = {
  phone: `tel:${restaurant.phone}`,
  whatsapp: `https://wa.me/${restaurant.whatsapp}`,
  instagram: restaurant.instagram,
  maps: restaurant.mapsUrl,
};

/** WhatsApp chat with a prefilled message. */
export const whatsappLink = (text: string) => `${contactLinks.whatsapp}?text=${encodeURIComponent(text)}`;

/** Only the networks the restaurant actually configured. */
export const socialLinks = (
  [
    { id: "instagram", label: "إنستغرام", href: restaurant.social.instagram, Icon: InstagramIcon },
    { id: "facebook", label: "فيسبوك", href: restaurant.social.facebook, Icon: FacebookIcon },
    { id: "tiktok", label: "تيك توك", href: restaurant.social.tiktok, Icon: TikTokIcon },
  ] as const
).filter((link): link is typeof link & { href: string } => Boolean(link.href));
