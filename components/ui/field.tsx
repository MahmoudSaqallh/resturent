import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Visible label, optional hint and an error announced with the field. */
export function Field({ id, label, optional, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ms-1.5 font-normal text-ink-muted">(اختياري)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export const describedBy = (id: string, error?: string, hint?: string) =>
  [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;

const control =
  "w-full rounded-md border bg-surface px-3.5 text-base text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-ink-muted/70 focus:outline-none focus-visible:outline-none focus:border-ink focus:ring-3 focus:ring-ink/10";

const state = (invalid?: boolean) =>
  invalid ? "border-danger focus:border-danger focus:ring-danger/15" : "border-line-strong hover:border-ink-muted";

export function TextInput({ invalid, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={cn(control, "h-12", state(invalid), className)} {...props} />;
}

export function TextArea({ invalid, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(control, "min-h-22 resize-y py-3 leading-relaxed", state(invalid), className)}
      {...props}
    />
  );
}

export function Select({ invalid, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select aria-invalid={invalid || undefined} className={cn(control, "h-12 appearance-auto", state(invalid), className)} {...props}>
      {children}
    </select>
  );
}
