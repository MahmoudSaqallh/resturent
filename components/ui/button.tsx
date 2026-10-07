import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "dark" | "outline" | "ghost" | "light" | "outline-light";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-97 disabled:pointer-events-none disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  dark: "bg-ink text-cream hover:bg-ink-soft",
  outline: "border border-line-strong bg-surface text-ink hover:border-ink",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-cream text-ink hover:bg-white",
  "outline-light": "border border-white/30 text-white hover:border-white/70 hover:bg-white/5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  xl: "h-14 px-6 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, className, type = "button", ...props },
  ref
) {
  return <button ref={ref} type={type} className={buttonClasses({ variant, size, className })} {...props} />;
});
