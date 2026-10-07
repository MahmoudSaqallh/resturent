"use client";

import type { Branch } from "@/types";
import { cn } from "@/lib/cn";
import { useOrderingState } from "@/features/restaurant/use-status";

/** Live branch state: مفتوح / مغلق / متوقف مؤقتاً (computed in the browser, never baked into HTML). */
export function BranchStatus({ branch, className }: { branch: Branch; className?: string }) {
  const state = useOrderingState(branch.id);
  if (!state) return <span aria-hidden="true" className={cn("skeleton inline-block h-6 w-16 rounded-full", className)} />;

  const paused = state.reason === "branch" || state.reason === "paused";
  const open = !paused && state.reason !== "manual" && state.status.isOpen;
  const label = paused ? "متوقف مؤقتاً" : open ? "مفتوح" : "مغلق";
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold",
        open ? "bg-success-tint text-success" : paused ? "bg-mustard-tint text-ink" : "bg-cream-deep text-ink-soft",
        className
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", open ? "bg-success" : paused ? "bg-mustard" : "bg-ink-muted")} />
      {label}
    </span>
  );
}
