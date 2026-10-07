import type { Coupon } from "@/types";

/**
 * Promo codes, validated on the server for every order.
 *
 * SAMPLE CODES — replace with the restaurant's real campaigns (or load them
 * from the backend). Codes are matched case-insensitively.
 */
export const coupons: Coupon[] = [
  {
    code: "WELCOME10",
    description: "خصم 10% على طلبك (حتى 15 ₪)",
    type: "percent",
    value: 10,
    maxDiscount: 15,
    minimumOrder: 50,
    active: true,
  },
  {
    code: "FREEDEL",
    description: "توصيل مجاني",
    type: "free-delivery",
    value: 0,
    minimumOrder: 40,
    active: true,
  },
  {
    code: "DRINKS5",
    description: "خصم 5 ₪ على المشروبات",
    type: "fixed",
    value: 5,
    minimumOrder: 12,
    categoryIds: ["cold-drinks", "hot-drinks"],
    active: true,
  },
  {
    code: "SUMMER25",
    description: "خصم 25 ₪",
    type: "fixed",
    value: 25,
    expiresAt: "2025-09-30T23:59:59+03:00",
    active: true,
  },
];
