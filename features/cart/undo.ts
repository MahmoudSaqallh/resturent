import type { CartItem } from "@/types";
import { createStore, useStore } from "@/lib/store";
import { restoreLine } from "./store";

/**
 * Last removed line, for the inline "undo" inside the cart drawer. A toast
 * can't be used there: an open modal dialog makes the rest of the page inert.
 */
interface RemovedLine {
  item: CartItem;
  index: number;
  name: string;
}

export const removedLineStore = createStore<RemovedLine | null>(null);

export function rememberRemoved(entry: RemovedLine) {
  removedLineStore.setState(entry);
}

export function undoRemove() {
  const entry = removedLineStore.getState();
  if (!entry) return;
  restoreLine(entry.item, entry.index);
  removedLineStore.setState(null);
}

export function dismissRemoved() {
  removedLineStore.setState(null);
}

export function useRemovedLine() {
  return useStore(removedLineStore, (state) => state);
}
