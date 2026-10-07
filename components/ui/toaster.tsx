"use client";

import { useEffect, useRef } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { dismissToast, useToasts, type Toast } from "@/features/toasts/store";
import { DURATION, EASE, gsap, prefersReducedMotion } from "@/lib/motion";

const ICONS = { success: CircleCheck, info: Info, error: CircleAlert };

function ToastItem({ toast }: { toast: Toast }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const Icon = ICONS[toast.tone];

  const start = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => dismissToast(toast.id), toast.duration);
  };
  const pause = () => clearTimeout(timer.current);

  useEffect(() => {
    start();
    if (ref.current && !prefersReducedMotion()) {
      gsap.fromTo(ref.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: DURATION.fast, ease: EASE.out });
    }
    return pause;
    // Each toast mounts once; the timer only depends on its id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id]);

  return (
    <div
      ref={ref}
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={start}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-lg bg-ink py-2.5 ps-3.5 pe-1.5 text-sm text-cream shadow-overlay md:w-auto md:min-w-80"
    >
      <Icon
        className={toast.tone === "error" ? "size-5 shrink-0 text-brand-glow" : "size-5 shrink-0 text-mustard"}
        aria-hidden="true"
      />
      <p className="flex-1 font-medium">{toast.message}</p>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            dismissToast(toast.id);
          }}
          className="h-9 rounded-md px-3 font-bold whitespace-nowrap text-mustard transition-colors hover:bg-white/10"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="إغلاق الإشعار"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-cream/70 transition-colors hover:bg-white/10 hover:text-cream"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Compact, non-blocking feedback. Rendered as a manual popover so it sits in
 * the top layer above open dialogs (cart drawer, product sheet). Screen
 * readers get the text through live regions that are always mounted.
 */
export function Toaster() {
  const toasts = useToasts();
  const ref = useRef<HTMLDivElement>(null);
  const latest = toasts.at(-1);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== "function") return;
    try {
      // Re-showing moves it to the top of the top-layer stack.
      if (el.matches(":popover-open")) el.hidePopover();
      if (toasts.length > 0) el.showPopover();
    } catch {
      // Popover unsupported or element detached: it renders as a fixed div.
    }
  }, [toasts]);

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite">
        {latest && latest.tone !== "error" ? latest.message : ""}
      </div>
      <div className="sr-only" role="alert">
        {latest?.tone === "error" ? latest.message : ""}
      </div>
      <div
        ref={ref}
        popover="manual"
        className="pointer-events-none fixed inset-x-0 top-auto bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] m-0 flex h-auto w-auto flex-col items-center gap-2 overflow-visible border-0 bg-transparent p-0 px-4 md:start-auto md:end-6 md:bottom-6 md:items-end md:px-0"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </>
  );
}
