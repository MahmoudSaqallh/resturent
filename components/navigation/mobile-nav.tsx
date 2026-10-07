"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Phone, ReceiptText } from "lucide-react";
import { cn } from "@/lib/cn";
import { closeNav, useOverlay } from "@/features/ui/overlays";
import { useOrders } from "@/features/orders/store";
import { Sheet, SheetHeader } from "@/components/ui/sheet";
import { contactLinks, WhatsAppIcon } from "@/components/ui/brand";
import { StatusPill, WorkingHours } from "@/components/layout/restaurant-status";
import { isActiveLink, MORE_LINKS, NAV_LINKS } from "./nav-links";

const TITLE_ID = "mobile-nav-title";

export function MobileNav() {
  const open = useOverlay("navOpen");
  const pathname = usePathname();
  const orders = useOrders();

  return (
    <Sheet open={open} onClose={closeNav} variant="nav" labelledBy={TITLE_ID}>
      <SheetHeader titleId={TITLE_ID} title="القائمة" onClose={closeNav} />
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <StatusPill className="mb-3" />
        <nav aria-label="الروابط الرئيسية">
          <ul className="flex flex-col">
            {[...NAV_LINKS, { href: "/drinks", label: "المشروبات" }, { href: "/build-meal", label: "كوّن وجبتك" }].map(
              (link) => {
                const active = isActiveLink(link.href, pathname);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeNav}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-13 items-center justify-between border-b border-line text-base font-semibold",
                        active ? "text-brand-ink" : "text-ink"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {active && <span aria-hidden="true" className="h-5 w-1 rounded-full bg-brand" />}
                        {link.label}
                      </span>
                      <ChevronLeft className="size-4 text-ink-muted" aria-hidden="true" />
                    </Link>
                  </li>
                );
              }
            )}
          </ul>
          <ul className="mt-4 grid grid-cols-2 gap-x-4">
            {MORE_LINKS.filter((link) => link.href !== "/orders" || orders.length > 0).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeNav}
                  aria-current={isActiveLink(link.href, pathname) ? "page" : undefined}
                  className="flex h-11 items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink aria-[current=page]:text-brand-ink"
                >
                  {link.href === "/orders" && <ReceiptText className="size-4 text-ink-muted" aria-hidden="true" />}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <h3 className="mt-6 mb-2 text-sm font-bold text-ink-muted">ساعات العمل</h3>
        <WorkingHours />
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <a
          href={contactLinks.phone}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line-strong bg-surface text-sm font-bold"
        >
          <Phone className="size-4" aria-hidden="true" />
          اتصل بنا
        </a>
        <a
          href={contactLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink text-sm font-bold text-cream"
        >
          <WhatsAppIcon size={18} />
          واتساب
        </a>
      </div>
    </Sheet>
  );
}
