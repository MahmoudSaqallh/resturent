import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gift } from "lucide-react";
import { restaurant } from "@/data/restaurant";

export const metadata: Metadata = { title: "نقاطي", robots: { index: false } };

/**
 * Loyalty ("نقاطي"). Exists only when the restaurant enables a real
 * programme in `restaurant.programs.loyalty`. Points, history and
 * redemption need customer accounts and a backend; until those exist the
 * page shows the configured rules and rewards only — never invented numbers.
 */
export default function LoyaltyPage() {
  const loyalty = restaurant.programs.loyalty;
  if (!loyalty.enabled) notFound();

  return (
    <div className="container-page max-w-2xl py-8 md:py-12">
      <h1 className="text-section font-extrabold">نقاطي</h1>
      <p className="mt-2 text-ink-soft">رصيد نقاطك وسجلها يظهران هنا بعد تفعيل حسابات العملاء.</p>

      {loyalty.rules && loyalty.rules.length > 0 && (
        <section aria-labelledby="rules-title" className="mt-8">
          <h2 id="rules-title" className="text-xl font-extrabold">
            طريقة الكسب والاستبدال
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-1.5 ps-5 text-ink-soft">
            {loyalty.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>
      )}

      {loyalty.rewards && loyalty.rewards.length > 0 && (
        <section aria-labelledby="rewards-title" className="mt-8">
          <h2 id="rewards-title" className="text-xl font-extrabold">
            المكافآت
          </h2>
          <ul className="mt-3 divide-y divide-line rounded-lg bg-surface px-4 ring-1 ring-line">
            {loyalty.rewards.map((reward) => (
              <li key={reward.id} className="flex items-center justify-between gap-3 py-3">
                <span className="flex items-center gap-2 font-semibold">
                  <Gift className="size-4 text-brand" aria-hidden="true" />
                  {reward.title}
                </span>
                <span className="tabular text-sm text-ink-muted">{reward.cost} نقطة</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
