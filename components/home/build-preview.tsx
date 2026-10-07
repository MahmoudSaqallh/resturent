import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

interface Step {
  title: string;
  text: string;
  image?: string;
}

/** Three plain steps into /build-meal — a preview, not the builder. */
export function BuildPreview({ steps, saving }: { steps: Step[]; saving: number }) {
  return (
    <section aria-labelledby="build-title" className="section-y">
      <div className="container-page">
        <div className="grid gap-8 rounded-lg border border-line bg-surface p-6 md:p-10 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-4">
            <p className="text-sm font-semibold text-brand-ink">كوّن وجبتك</p>
            <h2 id="build-title" className="mt-2 text-section font-extrabold">
              وجبتك على مزاجك
            </h2>
            <p className="mt-2 text-ink-muted">
              ثلاث خطوات بسيطة{saving > 0 ? `، ونخصم ${formatPrice(saving)} من المجموع.` : "."}
            </p>
            <Link href="/build-meal" className={buttonClasses({ variant: "dark", size: "lg", className: "mt-6 px-6 max-sm:w-full" })}>
              كوّن وجبتك
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <Reveal
            as="div"
            selector="[data-step]"
            className="grid gap-6 sm:grid-cols-3 sm:gap-0 lg:col-span-8"
          >
            {steps.map((step, index) => (
              <div
                key={step.title}
                data-step
                className="flex items-center gap-4 sm:flex-col sm:items-start sm:px-6 sm:not-first:border-s sm:not-first:border-line sm:first:ps-0"
              >
                <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-cream-deep">
                  {step.image && <Image src={step.image} alt="" fill sizes="64px" className="object-cover" />}
                </span>
                <div>
                  <p className="tabular text-xs font-semibold text-ink-muted">الخطوة {index + 1}</p>
                  <h3 className="mt-0.5 text-lg font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{step.text}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
