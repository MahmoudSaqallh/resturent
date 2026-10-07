import type { Metadata } from "next";
import { DiscoverView } from "@/components/menu/discover-view";

export const metadata: Metadata = {
  title: "اكتشف",
  description: "اكتشف وجبتك حسب مزاجك وميزانيتك: خفيفة، مشبعة، حارة، حلوة أو مشروب.",
};

export default function DiscoverPage() {
  return <DiscoverView />;
}
