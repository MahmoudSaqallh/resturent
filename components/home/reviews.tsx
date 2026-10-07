import { Star } from "lucide-react";
import type { Review } from "@/types";
import { HomeHeading } from "./home-heading";

/** Two or three real reviews in minimal cards. Absent when there are none. */
export function Reviews({ reviews }: { reviews: Review[] }) {
  const shown = reviews.slice(0, 3);
  if (shown.length === 0) return null;
  return (
    <section aria-labelledby="reviews-title" className="section-y">
      <div className="container-page">
        <HomeHeading id="reviews-title" title="آراء زبائننا" />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {shown.map((review) => (
            <li key={`${review.author}-${review.text.slice(0, 16)}`} className="rounded-lg border border-line bg-surface p-6">
              {review.rating !== undefined && (
                <p className="flex gap-0.5 text-brand" aria-label={`تقييم ${review.rating} من 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={i < review.rating! ? "size-4 fill-current" : "size-4 text-line-strong"} aria-hidden="true" />
                  ))}
                </p>
              )}
              <blockquote className="mt-3 leading-relaxed">«{review.text}»</blockquote>
              <p className="mt-4 text-sm font-semibold">
                {review.author}
                {review.source && <span className="font-normal text-ink-muted"> · {review.source}</span>}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
