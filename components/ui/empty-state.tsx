import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "gap-2 py-8" : "gap-3 py-14", className)}>
      {icon && (
        <div className="mb-1 flex size-16 items-center justify-center rounded-full bg-cream-deep text-ink-soft" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className={cn("font-bold text-ink", compact ? "text-lg" : "text-xl")}>{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
