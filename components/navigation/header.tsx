"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/store";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { useCartCount } from "@/features/cart/use-cart";
import { useFavoritesCount } from "@/features/favorites/store";
import { MENU_PATH } from "@/features/menu/menu-url";
import { openCart, openNav, openSearch } from "@/features/ui/overlays";
import { Logo } from "@/components/ui/brand";
import { buttonClasses } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { isActiveLink, NAV_LINKS } from "./nav-links";

const SCROLL_THRESHOLD = 8;

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

/** true once the page has scrolled; false on the server. */
function useScrolled() {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > SCROLL_THRESHOLD,
    () => false
  );
}

/** Gives the cart a short nudge when its count goes up (not on first load). */
function useCartBump(count: number) {
  const ref = useRef<HTMLButtonElement>(null);
  const previous = useRef<number | null>(null);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const before = previous.current;
    previous.current = count;
    if (before === null || count <= before || !ref.current || prefersReducedMotion()) return;
    const icon = ref.current.querySelector("svg");
    const badge = ref.current.querySelector("[data-badge]");
    const tl = gsap.timeline();
    if (icon) tl.fromTo(icon, { y: -3 }, { y: 0, duration: 0.2, ease: "power2.out" }, 0);
    if (badge) tl.fromTo(badge, { scale: 1.25 }, { scale: 1, duration: 0.2, ease: "power2.out" }, 0);
    return () => {
      tl.kill();
    };
  }, [count, hydrated]);

  return ref;
}

/** Compact sticky navbar; a hairline border and soft shadow appear once the page scrolls. */
export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const favorites = useFavoritesCount();
  const count = useCartCount();
  const cartRef = useCartBump(count);
  const cartLabel = count > 0 ? `السلة، ${count} في السلة` : "السلة فارغة";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-(--header-h) border-b bg-cream/95 transition-[border-color,box-shadow] duration-300 print:hidden",
        scrolled ? "border-line shadow-[0_1px_12px_-6px_rgb(26_21_18/0.12)]" : "border-transparent"
      )}
    >
      <div className="container-page flex h-full items-center gap-2">
        <Logo />

        <nav aria-label="الروابط الرئيسية" className="ms-6 hidden lg:block xl:ms-10">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActiveLink(link.href, pathname);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-11 items-center px-3 text-sm font-semibold transition-colors",
                      "after:absolute after:inset-x-3 after:bottom-2 after:h-0.5 after:rounded-full after:bg-brand after:transition-transform after:duration-200",
                      active
                        ? "text-ink after:scale-x-100"
                        : "text-ink-soft after:scale-x-0 hover:text-ink hover:after:scale-x-50"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-0.5 md:gap-1">
          <IconButton label="ابحث في القائمة" onClick={openSearch}>
            <Search className="size-5.5" aria-hidden="true" />
          </IconButton>
          <Link
            href="/favorites"
            aria-label={favorites > 0 ? `المفضلة، ${favorites}` : "المفضلة"}
            aria-current={pathname === "/favorites" ? "page" : undefined}
            className={cn(
              "relative inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-ink/6",
              pathname === "/favorites" && "bg-ink/6"
            )}
          >
            <Heart className={cn("size-5.5", pathname === "/favorites" && "fill-brand text-brand")} aria-hidden="true" />
            {favorites > 0 && (
              <span
                aria-hidden="true"
                className="tabular absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs leading-none font-bold text-cream ring-2 ring-cream"
              >
                {favorites}
              </span>
            )}
          </Link>
          <IconButton ref={cartRef} label={cartLabel} onClick={openCart} badge={count}>
            <ShoppingBag className="size-5.5" aria-hidden="true" />
          </IconButton>
          <Link href={MENU_PATH} className={buttonClasses({ variant: "primary", size: "md", className: "ms-2 px-5 max-lg:hidden" })}>
            اطلب الآن
          </Link>
          <IconButton label="فتح القائمة" onClick={openNav} className="lg:hidden">
            <Menu className="size-5.5" aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
