import { MapPin, Phone } from "lucide-react";
import type { Branch } from "@/types";
import { cn } from "@/lib/cn";
import { WorkingHours } from "@/components/layout/restaurant-status";
import { buttonClasses } from "@/components/ui/button";
import { BranchStatus } from "./branch-status";

/** Address, phone, map link and weekly hours for one branch. */
export function VisitPanel({ branch, className, title }: { branch: Branch; className?: string; title?: string }) {
  return (
    <div className={cn("grid gap-6 rounded-lg bg-surface p-5 ring-1 ring-line md:grid-cols-2 md:p-7", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {title && <h3 className="text-lg font-extrabold">{title}</h3>}
          <BranchStatus branch={branch} />
        </div>
        <p className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
          {branch.address}
        </p>
        <p className="flex items-center gap-2.5">
          <Phone className="size-5 shrink-0 text-brand" aria-hidden="true" />
          <a href={`tel:${branch.phone}`} className="tabular font-semibold underline-offset-4 hover:underline" dir="ltr">
            {branch.phoneDisplay}
          </a>
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <a
            href={branch.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "outline", size: "md" })}
          >
            الاتجاهات
          </a>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold text-ink-muted">ساعات العمل</h3>
        <WorkingHours hours={branch.hours} />
      </div>
    </div>
  );
}
