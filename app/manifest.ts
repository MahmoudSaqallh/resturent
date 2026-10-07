import type { MetadataRoute } from "next";
import { restaurant } from "@/data/restaurant";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${restaurant.name} — ${restaurant.tagline}`,
    short_name: restaurant.name,
    description: restaurant.description,
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf6ef",
    theme_color: "#faf6ef",
    categories: ["food", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "المنيو", url: "/menu" },
      { name: "العروض", url: "/offers" },
      { name: "طلباتي", url: "/orders" },
    ],
  };
}
