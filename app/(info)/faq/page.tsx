import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { buildFaq } from "@/features/restaurant/faq";
import { buttonClasses } from "@/components/ui/button";
import { contactLinks, WhatsAppIcon } from "@/components/ui/brand";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description: `ساعات العمل، مناطق التوصيل، طرق الدفع وطريقة الطلب من ${restaurant.name}.`,
};

export default function FaqPage() {
  const faq = buildFaq(restaurant);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <h1 className="text-section font-extrabold">الأسئلة الشائعة</h1>
      <p className="mt-2 text-ink-muted md:text-lg">إجابات مباشرة من إعدادات المطعم الحالية.</p>

      <div className="mt-8 divide-y divide-line rounded-lg bg-surface ring-1 ring-line">
        {faq.map((item) => (
          <details key={item.question} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-bold md:px-5 [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown
                className="size-5 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </summary>
            <p className="px-4 pb-4 leading-relaxed text-ink-soft md:px-5">{item.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-cream-deep p-5">
        <p className="font-semibold">ما لقيت جواب سؤالك؟</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={contactLinks.whatsapp}
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
      </div>
    </div>
  );
}
