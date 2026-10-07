import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { restaurant } from "@/data/restaurant";
import { ReservationForm } from "@/components/info/reservation-form";

export const metadata: Metadata = { title: "حجز طاولة" };

/** Only when the restaurant takes reservations (`restaurant.services.reservations`). */
export default function ReservationsPage() {
  const reservations = restaurant.services.reservations;
  if (!reservations) notFound();

  return (
    <div className="container-page max-w-2xl py-8 md:py-12">
      <h1 className="text-section font-extrabold">حجز طاولة</h1>
      <p className="mt-2 mb-8 text-ink-soft">أرسل طلب الحجز ونؤكده لك على واتساب.</p>
      <ReservationForm maxPartySize={reservations.maxPartySize} />
    </div>
  );
}
