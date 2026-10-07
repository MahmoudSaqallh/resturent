import type { Metadata } from "next";
import { restaurant } from "@/data/restaurant";
import { formatPrice } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { contactLinks, whatsappLink, WhatsAppIcon } from "@/components/ui/brand";

export const metadata: Metadata = {
  title: "التوصيل والإلغاء",
  description: `مناطق التوصيل والرسوم والحد الأدنى للطلب وسياسة الإلغاء في ${restaurant.name}.`,
};

/** Delivery rules straight from the restaurant settings, so this page can never drift from checkout. */
export default function DeliveryPolicyPage() {
  const zones = restaurant.deliveryZones;
  const showEta = zones.some((zone) => zone.etaMinutes);
  const { policies, scheduling } = restaurant;

  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <h1 className="text-section font-extrabold">التوصيل والإلغاء</h1>
      {policies.delivery && <p className="mt-2 text-ink-soft md:text-lg">{policies.delivery}</p>}

      {restaurant.fulfillment.delivery && zones.length > 0 && (
        <section aria-labelledby="zones-title" className="mt-8">
          <h2 id="zones-title" className="text-xl font-extrabold">
            مناطق التوصيل
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-line">
            <table className="w-full min-w-[22rem] bg-surface text-sm">
              <thead className="bg-cream-deep text-start text-ink-soft">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    المنطقة
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    رسوم التوصيل
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">
                    الحد الأدنى
                  </th>
                  {showEta && (
                    <th scope="col" className="px-4 py-3 text-start font-semibold">
                      الوقت التقريبي
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {zones.map((zone) => {
                  const minimum = zone.minimumOrder ?? restaurant.deliveryMinimum;
                  return (
                    <tr key={zone.id}>
                      <th scope="row" className="px-4 py-3 text-start font-semibold">
                        {zone.name}
                      </th>
                      <td className="tabular px-4 py-3">{formatPrice(zone.fee)}</td>
                      <td className="tabular px-4 py-3">{minimum ? formatPrice(minimum) : "—"}</td>
                      {showEta && <td className="px-4 py-3">{zone.etaMinutes ? `حوالي ${zone.etaMinutes} دقيقة` : "—"}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 flex list-disc flex-col gap-1.5 ps-5 text-sm text-ink-soft">
            {restaurant.freeDeliveryOver !== undefined && (
              <li>التوصيل مجاني للطلبات من {formatPrice(restaurant.freeDeliveryOver)} فأكثر.</li>
            )}
            {scheduling.enabled && <li>يمكنك جدولة طلبك ضمن ساعات العمل حتى {scheduling.daysAhead} أيام مقدماً.</li>}
            <li>رسوم منطقتك والمجموع النهائي يظهران قبل تأكيد الطلب.</li>
          </ul>
        </section>
      )}

      <section aria-labelledby="cancel-title" className="mt-10">
        <h2 id="cancel-title" className="text-xl font-extrabold">
          الإلغاء والتعديل
        </h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          {policies.cancellation ??
            "لتعديل طلبك أو إلغائه، تواصل معنا بأسرع وقت وأخبرنا برقم الطلب، وسنساعدك حسب مرحلة تحضيره."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={whatsappLink("مرحباً، أريد تعديل/إلغاء الطلب رقم ")}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "dark", size: "md" })}
          >
            <WhatsAppIcon size={18} />
            واتساب
          </a>
          <a href={contactLinks.phone} className={buttonClasses({ variant: "outline", size: "md" })}>
            اتصل بنا
          </a>
        </div>
      </section>
    </div>
  );
}
