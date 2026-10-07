import { MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import type { ImageAsset } from "@/types";
import { restaurant } from "@/data/restaurant";
import { buttonClasses } from "@/components/ui/button";
import { contactLinks, WhatsAppIcon } from "@/components/ui/brand";
import { StatusPill, WorkingHours } from "@/components/layout/restaurant-status";
import { FoodImage } from "@/components/products/food-image";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-6">
      <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Practical info: address, live opening status from the configured hours, direct actions. */
export function Location({ image }: { image: ImageAsset }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section-y">
      <div className="container-page grid gap-8 md:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-sm font-semibold text-brand-ink">الموقع وساعات العمل</p>
          <h2 id="contact-title" className="mt-2 text-section font-extrabold">
            زورنا أو اطلب لبيتك
          </h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            <Row label="العنوان">
              <p className="font-semibold">{restaurant.address}</p>
            </Row>
            <Row label="ساعات العمل">
              <StatusPill />
              <WorkingHours className="-mx-2 mt-3 max-w-xs" />
            </Row>
            <Row label="الهاتف">
              <a href={contactLinks.phone} className="tabular font-semibold hover:underline" dir="ltr">
                {restaurant.phoneDisplay}
              </a>
            </Row>
            <Row label="واتساب">
              <a
                href={contactLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold hover:underline"
              >
                <WhatsAppIcon size={18} />
                راسلنا على واتساب
              </a>
            </Row>
          </dl>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:flex">
            <a href={contactLinks.maps} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "dark", size: "lg" })}>
              <MapPin className="size-4" aria-hidden="true" />
              افتح الاتجاهات
            </a>
            <a href={contactLinks.phone} className={buttonClasses({ variant: "outline", size: "lg" })}>
              <Phone className="size-4" aria-hidden="true" />
              اتصل بنا
            </a>
          </div>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-lg md:aspect-auto md:min-h-full">
          <FoodImage src={image.src} alt={image.alt} fill sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw" />
        </div>
      </div>
    </section>
  );
}
