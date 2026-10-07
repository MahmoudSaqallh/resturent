import type { Metadata } from "next";
import { ComboBuilder } from "@/components/offers/combo-builder";

export const metadata: Metadata = {
  title: "كوّن وجبتك",
  description: "كوّن وجبتك خطوة بخطوة: الوجبة الأساسية، الحجم، الجانب، المشروب، الصوص والإضافات.",
};

export default function BuildMealPage() {
  return <ComboBuilder />;
}
