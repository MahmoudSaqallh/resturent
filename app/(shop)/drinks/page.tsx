import type { Metadata } from "next";
import { DrinksView } from "@/components/drinks/drinks-view";

export const metadata: Metadata = {
  title: "المشروبات",
  description: "مشروبات غازية، عصائر طازجة، قهوة ومشروبات ساخنة — اختر الحجم وأضفها لطلبك.",
};

export default function DrinksPage() {
  return <DrinksView />;
}
