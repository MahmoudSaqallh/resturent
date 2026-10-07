"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const offline = typeof navigator !== "undefined" && !navigator.onLine;

  return (
    <div className="container-page py-16">
      <EmptyState
        icon={<WifiOff className="size-7" />}
        title={offline ? "لا يوجد اتصال بالإنترنت" : "تعذّر تحميل الصفحة"}
        description={
          offline
            ? "تأكد من اتصالك ثم حاول مرة أخرى. سلتك ومفضلتك محفوظة على جهازك."
            : "حصل خلل مؤقت أثناء تحميل القائمة. حاول مرة أخرى بعد لحظات."
        }
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => retry()} className={buttonClasses({ size: "lg" })}>
              <RefreshCw className="size-4" aria-hidden="true" />
              حاول مرة أخرى
            </button>
            <Link href="/" className={buttonClasses({ variant: "outline", size: "lg" })}>
              العودة للرئيسية
            </Link>
          </div>
        }
      />
    </div>
  );
}
