import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, CalendarDays, Phone, Users } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { formatPrice } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { contactLinks, whatsappLink, WhatsAppIcon } from "@/components/ui/brand";

export const metadata: Metadata = {
  title: "طلبات كبيرة",
  description: `طلبات الشركات والمجموعات والمناسبات من ${restaurant.name}.`,
};

const USES = [
  { icon: Building2, title: "شركات ومكاتب", text: "غداء للفريق أو اجتماع." },
  { icon: Users, title: "مجموعات", text: "رحلات، نوادي وتجمعات العائلة." },
  { icon: CalendarDays, title: "مناسبات", text: "أعياد ميلاد ولقاءات خاصة." },
];

/**
 * Large orders go straight to the restaurant (phone / WhatsApp): quantities,
 * timing and pricing are agreed directly. Catering details appear only when
 * the restaurant configures that service.
 */
export default function LargeOrdersPage() {
  const { largeOrders, catering } = restaurant.services;
  if (!largeOrders.enabled) notFound();

  const message = "مرحباً، أريد الاستفسار عن طلب كبير:\n- عدد الأشخاص:\n- التاريخ والوقت:\n- توصيل أو استلام:";

  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <h1 className="text-section font-extrabold">طلبات كبيرة</h1>
      <p className="mt-2 max-w-xl text-ink-soft md:text-lg">
        {largeOrders.note ?? "عندك طلب لمجموعة؟ تواصل معنا مباشرة لنتفق على الأصناف والكميات والموعد المناسب."}
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {USES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="border-t-2 border-brand pt-3">
            <Icon className="size-5 text-brand" aria-hidden="true" />
            <p className="mt-2 font-bold">{title}</p>
            <p className="text-sm text-ink-muted">{text}</p>
          </li>
        ))}
      </ul>

      {catering && (
        <section aria-labelledby="catering-title" className="mt-10 rounded-lg bg-surface p-5 ring-1 ring-line md:p-6">
          <h2 id="catering-title" className="text-xl font-extrabold">
            خدمة المناسبات
          </h2>
          {catering.note && <p className="mt-1 text-ink-soft">{catering.note}</p>}
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-muted">نوع المناسبة</dt>
              <dd className="font-semibold">{catering.eventTypes.join("، ")}</dd>
            </div>
            {catering.minimumGuests && (
              <div>
                <dt className="text-ink-muted">الحد الأدنى للضيوف</dt>
                <dd className="font-semibold">{catering.minimumGuests}</dd>
              </div>
            )}
            {catering.minimumOrder && (
              <div>
                <dt className="text-ink-muted">الحد الأدنى للطلب</dt>
                <dd className="tabular font-semibold">{formatPrice(catering.minimumOrder)}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <div className="mt-10 rounded-lg bg-cream-deep p-5 md:p-6">
        <p className="font-bold">أرسل لنا التفاصيل</p>
        <p className="mt-1 text-sm text-ink-soft">عدد الأشخاص، التاريخ والوقت، وتوصيل أو استلام. نرد عليك بالأصناف والسعر.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "dark", size: "lg" })}
          >
            <WhatsAppIcon size={18} />
            راسلنا على واتساب
          </a>
          <a href={contactLinks.phone} className={buttonClasses({ variant: "outline", size: "lg" })}>
            <Phone className="size-4" aria-hidden="true" />
            اتصل {restaurant.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
