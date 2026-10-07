import { createStore, useStore } from "@/lib/store";
import { markViewed } from "@/features/menu/recently-viewed";

export interface ProductTarget {
  productId: string;
  /** Set when editing an existing cart line. */
  lineId?: string;
  /** Changes on every open so the form starts fresh. */
  nonce: number;
}

interface OverlayState {
  cartOpen: boolean;
  searchOpen: boolean;
  navOpen: boolean;
  product: ProductTarget | null;
}

export const overlayStore = createStore<OverlayState>({
  cartOpen: false,
  searchOpen: false,
  navOpen: false,
  product: null,
});

const patch = (next: Partial<OverlayState>) => overlayStore.setState((state) => ({ ...state, ...next }));

export const openCart = () => patch({ cartOpen: true, searchOpen: false, navOpen: false });
export const closeCart = () => patch({ cartOpen: false });
export const openSearch = () => patch({ searchOpen: true, navOpen: false });
export const closeSearch = () => patch({ searchOpen: false });
export const openNav = () => patch({ navOpen: true });
export const closeNav = () => patch({ navOpen: false });

/** Opens the product sheet. Editing keeps the cart open underneath. */
export function openProduct(productId: string, lineId?: string) {
  markViewed(productId);
  patch({ product: { productId, lineId, nonce: Date.now() }, searchOpen: false, navOpen: false });
}

export const closeProduct = () => patch({ product: null });

export function closeAllOverlays() {
  const state = overlayStore.getState();
  if (state.cartOpen || state.searchOpen || state.navOpen || state.product) {
    overlayStore.setState({ cartOpen: false, searchOpen: false, navOpen: false, product: null });
  }
}

export function useOverlay<K extends keyof OverlayState>(key: K): OverlayState[K] {
  return useStore(overlayStore, (state) => state[key]);
}
