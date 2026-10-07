import { cn } from "@/lib/cn";

/** Matches ProductCard's responsive layout so nothing jumps when data arrives. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-row-reverse gap-3 rounded-lg bg-surface p-2.5 ring-1 ring-line sm:flex-col sm:gap-0 sm:p-0">
      <div className="skeleton size-28 shrink-0 rounded-md sm:aspect-4/3 sm:size-auto sm:w-full sm:rounded-b-none sm:rounded-t-lg" />
      <div className="flex flex-1 flex-col gap-2 sm:p-3.5">
        <div className="skeleton h-5 w-3/4 rounded-sm" />
        <div className="skeleton h-4 w-full rounded-sm" />
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="skeleton h-6 w-16 rounded-sm" />
          <div className="skeleton h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div
      aria-busy="true"
      aria-label="جارٍ التحميل"
      className={cn("grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4", className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
