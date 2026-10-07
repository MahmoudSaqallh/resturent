"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { closeCart, closeNav, closeSearch } from "@/features/ui/overlays";
import { menuHref, type MenuCategory } from "./menu-url";

/** Opens the menu page from anywhere, optionally on a category. */
export function useGoToMenu() {
  const router = useRouter();
  return useCallback(
    (category?: MenuCategory) => {
      closeCart();
      closeNav();
      closeSearch();
      router.push(menuHref(category));
    },
    [router]
  );
}
