"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { DURATION, EASE, gsap, prefersReducedMotion } from "@/lib/motion";

/* ------------------------------------------------------------------
   Overlay built on the native <dialog>: focus trap, Esc, inert page
   and top-layer stacking come from the browser. GSAP animates the
   panel and the scrim; the dialog closes after the exit animation.
   ------------------------------------------------------------------ */

export type SheetVariant = "drawer" | "modal" | "search" | "nav";

const panelVariants: Record<SheetVariant, string> = {
  // Bottom sheet on phones, side drawer (end side) from tablet up.
  drawer:
    "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl md:inset-y-0 md:start-auto md:end-0 md:h-full md:max-h-none md:w-[26rem] md:rounded-none",
  // Bottom sheet on phones, centered dialog from tablet up.
  modal:
    "inset-x-0 bottom-0 max-h-[94dvh] rounded-t-xl md:inset-0 md:m-auto md:h-fit md:max-h-[88dvh] md:w-[min(60rem,calc(100%-3rem))] md:rounded-xl",
  search:
    "inset-0 md:inset-x-0 md:top-20 md:bottom-auto md:mx-auto md:max-h-[min(40rem,calc(100dvh-7rem))] md:w-[min(42rem,calc(100%-3rem))] md:rounded-xl",
  nav: "inset-y-0 start-0 w-[min(22rem,88vw)]",
};

function hiddenState(variant: SheetVariant): gsap.TweenVars {
  const desktop = window.matchMedia("(min-width: 48rem)").matches;
  const rtl = document.documentElement.dir === "rtl";
  const toEnd = rtl ? -100 : 100;
  switch (variant) {
    case "drawer":
      return desktop ? { xPercent: toEnd } : { yPercent: 100 };
    case "modal":
      return desktop ? { opacity: 0, y: 16, scale: 0.98 } : { yPercent: 100 };
    case "search":
      return desktop ? { opacity: 0, y: -10 } : { opacity: 0, y: 12 };
    case "nav":
      return { xPercent: -toEnd };
  }
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  variant: SheetVariant;
  /** id of the visible title; or pass `label`. */
  labelledBy?: string;
  label?: string;
  initialFocus?: RefObject<HTMLElement | null>;
  className?: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, variant, labelledBy, label, initialFocus, className, children }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    if (!dialog || !panel || !scrim) return;
    gsap.killTweensOf([panel, scrim]);

    if (open) {
      if (!dialog.open) {
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialog.showModal();
        initialFocus?.current?.focus();
      }
      if (prefersReducedMotion()) {
        gsap.set([panel, scrim], { clearProps: "all" });
        return;
      }
      gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: DURATION.base, ease: "none" });
      gsap.fromTo(panel, hiddenState(variant), {
        xPercent: 0,
        yPercent: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: EASE.out,
        clearProps: "transform,opacity",
      });
      return;
    }

    if (!dialog.open) return;
    const finish = () => {
      dialog.close();
      gsap.set([panel, scrim], { clearProps: "all" });
      const target = returnFocus.current;
      returnFocus.current = null;
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    gsap.to(scrim, { opacity: 0, duration: DURATION.fast, ease: "none" });
    gsap.to(panel, { ...hiddenState(variant), duration: 0.2, ease: EASE.in, onComplete: finish });
  }, [open, variant, initialFocus]);

  return (
    <dialog
      ref={dialogRef}
      className="sheet"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // The browser can force-close (e.g. repeated Esc); keep state in sync.
      onClose={() => {
        if (open) onClose();
      }}
    >
      <div ref={scrimRef} className="fixed inset-0 bg-ink/55" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} className={cn("fixed flex flex-col overflow-hidden bg-cream shadow-overlay", panelVariants[variant], className)}>
        {children}
      </div>
    </dialog>
  );
}

export function SheetHeader({
  titleId,
  title,
  onClose,
  children,
  className,
}: {
  titleId: string;
  title: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-3 border-b border-line px-4 py-2.5 md:px-5", className)}>
      <h2 id={titleId} className="min-w-0 flex-1 truncate text-lg font-bold">
        {title}
      </h2>
      {children}
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="-me-2 inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/6"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
