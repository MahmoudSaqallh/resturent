import type { Metadata } from "next";
import { OrderView } from "@/components/orders/order-view";

export const metadata: Metadata = { title: "طلبك", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  return <OrderView id={id} isNew={isNew === "1"} />;
}
