"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Link2, Share2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { showToast } from "@/features/toasts/store";
import { WhatsAppIcon } from "@/components/ui/brand";

/**
 * Share a link. Phones with a native share sheet get it directly; elsewhere
 * a small menu offers "copy link" and WhatsApp.
 */
export function ShareMenu({
  url,
  title,
  text,
  label,
  showLabel,
  className,
}: {
  /** Absolute URL, or a path resolved against the current origin. */
  url: string;
  title: string;
  /** Message used for WhatsApp / native share. */
  text?: string;
  label: string;
  /** Visible text trigger instead of an icon button. */
  showLabel?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const absolute = () => new URL(url, window.location.origin).toString();

  const onTrigger = async () => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse && navigator.share) {
      try {
        await navigator.share({ title, text, url: absolute() });
      } catch {
        // Dismissed by the user: nothing to do.
      }
      return;
    }
    setOpen((value) => !value);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(absolute());
      showToast("تم نسخ الرابط", { tone: "info" });
    } catch {
      showToast("تعذّر نسخ الرابط", { tone: "error" });
    }
    setOpen(false);
  };

  const item =
    "flex h-11 w-full items-center gap-2.5 rounded-md px-3 text-start text-sm font-semibold text-ink hover:bg-cream-deep focus-visible:bg-cream-deep focus-visible:outline-none";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={onTrigger}
        aria-label={showLabel ? undefined : label}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={
          showLabel
            ? "inline-flex h-11 items-center gap-2 text-sm font-semibold text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            : "inline-flex size-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/6 hover:text-ink"
        }
      >
        <Share2 className={showLabel ? "size-4" : "size-5"} aria-hidden="true" />
        {showLabel && label}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={cn(
            "absolute top-full z-20 mt-1 w-56 rounded-lg bg-surface p-1.5 shadow-overlay ring-1 ring-line",
            showLabel ? "start-0" : "end-0"
          )}
        >
          <button type="button" role="menuitem" onClick={copy} className={item}>
            <Link2 className="size-4 text-ink-muted" aria-hidden="true" />
            نسخ الرابط
          </button>
          <a
            role="menuitem"
            href={`https://wa.me/?text=${encodeURIComponent(`${text ?? title}\n${typeof window === "undefined" ? url : absolute()}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={item}
          >
            <WhatsAppIcon size={16} />
            مشاركة عبر واتساب
          </a>
        </div>
      )}
    </div>
  );
}
