import type { Metadata, Viewport } from "next";
import { Alexandria, Marhey, Readex_Pro } from "next/font/google";
import { restaurant } from "@/data/restaurant";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorker } from "@/components/layout/service-worker";
import "./globals.css";

const display = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-display-face",
  display: "swap",
});

const text = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-text",
  display: "swap",
});

// Hand-lettered accent for one short phrase in the hero. Not preloaded: it is decorative.
const hand = Marhey({
  subsets: ["arabic"],
  weight: "500",
  variable: "--font-hand-face",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${restaurant.name} — ${restaurant.tagline}`,
    template: `%s | ${restaurant.name}`,
  },
  description: restaurant.description,
  applicationName: restaurant.name,
  appleWebApp: { capable: true, title: restaurant.name, statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#faf6ef",
};

/**
 * Runs before paint: flags that the hero entrance may animate (and hides its
 * parts until GSAP takes over). A timeout reveals everything if JS stalls.
 */
const MOTION_FLAG = `try{if(matchMedia('(prefers-reduced-motion: no-preference)').matches){var d=document.documentElement;d.classList.add('motion-ready');setTimeout(function(){d.classList.add('motion-failsafe')},2500)}}catch(e){}`;

/** Document + fonts only. Header, overlays and the catalog live in the route-group layouts. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${display.variable} ${text.variable} ${hand.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="fixed start-3 top-3 z-[70] -translate-y-24 rounded-md bg-ink px-4 py-3 text-sm font-bold text-cream transition-transform focus:translate-y-0"
        >
          تخطَّ إلى المحتوى
        </a>
        {children}
        <Toaster />
        <ServiceWorker />
      </body>
    </html>
  );
}
