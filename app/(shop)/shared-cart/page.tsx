import type { Metadata } from "next";
import { SharedCartView } from "@/components/cart/shared-cart-view";

export const metadata: Metadata = { title: "سلة مشتركة", robots: { index: false } };

export default function SharedCartPage() {
  return <SharedCartView />;
}
