import { TriangleAlert } from "lucide-react";
import type { Allergen, DietaryTag, Product } from "@/types";
import { cn } from "@/lib/cn";

const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegetarian: "نباتي",
  vegan: "نباتي صرف",
  "gluten-free": "خالٍ من الغلوتين",
};

const ALLERGEN_LABELS: Record<Allergen, string> = {
  dairy: "حليب ومشتقاته",
  gluten: "غلوتين (قمح)",
  nuts: "مكسرات",
  eggs: "بيض",
  soy: "صويا",
  sesame: "سمسم",
  fish: "سمك",
};

/**
 * Allergens and nutrition — rendered only from verified product data.
 * When allergen data is missing we say so instead of implying "none".
 */
export function ProductFacts({ product, className }: { product: Product; className?: string }) {
  const { allergens, nutrition } = product;
  if (product.hidden) return null;

  return (
    <div className={cn("flex flex-col gap-4 text-sm", className)}>
      {product.dietary && product.dietary.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="معلومات غذائية موثّقة">
          {product.dietary.map((tag) => (
            <li key={tag} className="rounded-sm bg-success-tint px-2.5 py-1 text-xs font-semibold text-success">
              {DIETARY_LABELS[tag]}
            </li>
          ))}
        </ul>
      )}
      {allergens ? (
        <div>
          <h3 className="font-bold text-ink">مسببات الحساسية</h3>
          {allergens.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {allergens.map((allergen) => (
                <li key={allergen} className="rounded-sm bg-mustard-tint px-2.5 py-1 text-xs font-semibold text-ink">
                  {ALLERGEN_LABELS[allergen]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-ink-soft">لا يحتوي على مسببات الحساسية الشائعة المدرجة لدينا.</p>
          )}
        </div>
      ) : (
        <p className="flex items-start gap-2 text-ink-muted">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          إذا عندك حساسية من أي مكوّن، اسألنا قبل الطلب.
        </p>
      )}

      {nutrition && (
        <div>
          <h3 className="font-bold text-ink">القيم الغذائية (للحصة)</h3>
          <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "سعرات", value: nutrition.calories, unit: "" },
              { label: "بروتين", value: nutrition.protein, unit: " غ" },
              { label: "كربوهيدرات", value: nutrition.carbs, unit: " غ" },
              { label: "دهون", value: nutrition.fat, unit: " غ" },
            ]
              .filter((row) => row.value !== undefined)
              .map((row) => (
                <div key={row.label} className="rounded-md bg-cream-deep px-3 py-2">
                  <dt className="text-xs text-ink-muted">{row.label}</dt>
                  <dd className="tabular font-bold">
                    {row.value}
                    {row.unit}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      )}
    </div>
  );
}
