import type { Metadata } from "next";
import { TrackOrderView } from "@/components/orders/track-order-view";

export const metadata: Metadata = { title: "تتبع طلبك", robots: { index: false } };

export default function TrackOrderPage() {
  return <TrackOrderView />;
}
