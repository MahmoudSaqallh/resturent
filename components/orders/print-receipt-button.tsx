"use client";

import { Printer } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/**
 * Prints the order page as a receipt (site chrome is hidden in print styles).
 * A tax invoice needs the restaurant's billing backend and is not generated here.
 */
export function PrintReceiptButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClasses({ variant: "ghost", size: "md" })}>
      <Printer className="size-4" aria-hidden="true" />
      طباعة الإيصال
    </button>
  );
}
