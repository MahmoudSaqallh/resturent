import type { Product, Selections } from "@/types";
import { showToast } from "@/features/toasts/store";
import { openCart, overlayStore } from "@/features/ui/overlays";
import { toggleFavorite } from "@/features/favorites/store";
import { addToCart, removeLine, restoreLine } from "./store";
import { rememberRemoved } from "./undo";
import { getMissingRequired, withDefaults } from "./pricing";

/** One-tap add for products whose required choices all have defaults. */
export function quickAdd(product: Product, preset?: Selections) {
  if (!product.available) return false;
  const selections = withDefaults(product, preset);
  if (getMissingRequired(product, selections).length > 0) return false;
  addToCart({ productId: product.id, selections, quantity: 1 });
  notifyAdded(product.name);
  return true;
}

export function notifyAdded(name: string, edited = false) {
  showToast(edited ? `تم تحديث ${name} في السلة` : `تمت إضافة ${name} للسلة ✓`, {
    action: { label: "عرض السلة", onClick: openCart },
  });
}

export function removeWithUndo(lineId: string, name: string) {
  const removed = removeLine(lineId);
  if (!removed) return;
  // Inside the open cart drawer the undo is shown inline (toasts are inert behind a modal).
  if (overlayStore.getState().cartOpen) {
    rememberRemoved({ ...removed, name });
    return;
  }
  showToast(`تمت إزالة ${name} من السلة`, {
    tone: "info",
    action: { label: "تراجع", onClick: () => restoreLine(removed.item, removed.index) },
  });
}

export function toggleFavoriteWithToast(product: Product) {
  const added = toggleFavorite(product.id);
  showToast(added ? `أُضيفت ${product.name} للمفضلة` : `أُزيلت ${product.name} من المفضلة`, {
    tone: added ? "success" : "info",
  });
  return added;
}
