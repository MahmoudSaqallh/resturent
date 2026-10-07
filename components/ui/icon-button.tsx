import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only controls need an accessible name. */
  label: string;
  children: ReactNode;
  badge?: number;
  tone?: "default" | "light" | "overlay";
  size?: "md" | "lg";
}

const tones = {
  default: "text-ink hover:bg-ink/6",
  light: "text-white hover:bg-white/10",
  overlay: "bg-white/95 text-ink shadow-card hover:bg-white",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, badge, tone = "default", size = "md", className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-150 active:scale-92",
        size === "md" ? "size-11" : "size-12",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          data-badge
          aria-hidden="true"
          className="tabular absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs leading-none font-bold text-white ring-2 ring-cream"
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
});
