import { restaurant } from "@/data/restaurant";

export const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/menu", label: "القائمة" },
  { href: "/offers", label: "العروض" },
  ...(restaurant.branches.length > 1 ? [{ href: "/branches", label: "الفروع" }] : []),
  { href: "/about", label: "عن المطعم" },
  { href: "/#contact", label: "تواصل معنا" },
] as const;

/** Secondary links for the footer and the mobile menu; optional services appear only when offered. */
export const MORE_LINKS: readonly { href: string; label: string }[] = [
  { href: "/discover", label: "اكتشف" },
  { href: "/orders", label: "طلباتي" },
  { href: "/track-order", label: "تتبع طلبك" },
  { href: "/favorites", label: "المفضلة" },
  ...(restaurant.programs.loyalty.enabled ? [{ href: "/loyalty", label: "نقاطي" }] : []),
  ...(restaurant.services.reservations ? [{ href: "/reservations", label: "حجز طاولة" }] : []),
  ...(restaurant.services.largeOrders.enabled ? [{ href: "/large-orders", label: "طلبات كبيرة" }] : []),
  { href: "/delivery", label: "التوصيل والإلغاء" },
  { href: "/faq", label: "الأسئلة الشائعة" },
];

/** Route-level active state; in-page anchors are never "current". */
export function isActiveLink(href: string, pathname: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
