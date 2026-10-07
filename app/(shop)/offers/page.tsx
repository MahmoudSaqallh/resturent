import type { Metadata } from "next";
import { OffersView } from "@/components/offers/offers-view";

export const metadata: Metadata = {
  title: "العروض",
  description: "عروض الوجبات والكومبو والعائلة بأسعار أقل من طلب كل صنف لوحده.",
};

export default function OffersPage() {
  return <OffersView />;
}
