import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ChoiceCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  icon: ReactNode;
  title: string;
  description?: string;
  disabled?: boolean;
}

/** Large radio card for fulfillment, timing and payment choices. */
export function ChoiceCard({ name, value, checked, onChange, icon, title, description, disabled }: ChoiceCardProps) {
  return (
    <label
      className={cn(
        "flex min-h-18 items-center gap-3 rounded-lg border bg-surface p-3.5 transition-[border-color,box-shadow] duration-150",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
        disabled ? "cursor-not-allowed border-line opacity-55" : "cursor-pointer",
        !disabled && (checked ? "border-ink ring-1 ring-ink ring-inset" : "border-line-strong hover:border-ink-muted")
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors",
          checked ? "bg-ink text-cream" : "bg-cream-deep text-ink-soft"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{title}</span>
        {description && <span className="block text-sm text-ink-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
          checked ? "border-ink" : "border-line-strong"
        )}
      >
        {checked && <span className="size-2.5 rounded-full bg-ink" />}
      </span>
    </label>
  );
}
