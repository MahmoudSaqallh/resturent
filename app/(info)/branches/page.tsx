import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { restaurant } from "@/data/restaurant";
import { FoodImage } from "@/components/products/food-image";
import { VisitPanel } from "@/components/info/visit-panel";

export const metadata: Metadata = { title: "الفروع" };

/** Exists only when the restaurant has more than one branch. */
export default function BranchesPage() {
  const { branches } = restaurant;
  if (branches.length < 2) notFound();

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-section font-extrabold">فروعنا</h1>
      <p className="mt-2 text-ink-muted md:text-lg">اختر الفرع الأقرب لك للاستلام، أو اطلب توصيل وسنوصل من الفرع المناسب.</p>
      <ul className="mt-8 flex flex-col gap-6">
        {branches.map((branch) => (
          <li key={branch.id} className="grid gap-4 lg:grid-cols-[20rem_1fr]">
            {branch.image && (
              <FoodImage
                src={branch.image}
                alt={`فرع ${branch.name}`}
                sizes="(min-width: 1024px) 320px, 100vw"
                className="aspect-3/2 w-full rounded-lg"
              />
            )}
            <VisitPanel branch={branch} title={branch.name} />
          </li>
        ))}
      </ul>
    </div>
  );
}
