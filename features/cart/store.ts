import type { CartItem, Selections } from "@/types";
import { isRecord } from "@/lib/is-record";
import { createPersistentStore } from "@/lib/store";
import { clampQuantity, lineKey, MAX_NOTE_LENGTH } from "./pricing";

interface CartState {
  items: CartItem[];
}

function parseSelections(raw: unknown): Selections | null {
  if (!isRecord(raw)) return null;
  const result: Selections = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) return null;
    result[key] = value;
  }
  return result;
}

function parseCart(raw: unknown): CartState | null {
  if (!isRecord(raw) || !Array.isArray(raw.items)) return null;
  const items: CartItem[] = [];
  for (const entry of raw.items) {
    if (!isRecord(entry)) continue;
    const selections = parseSelections(entry.selections);
    if (typeof entry.id !== "string" || typeof entry.productId !== "string" || !selections) continue;
    if (typeof entry.quantity !== "number") continue;
    items.push({
      id: entry.id,
      productId: entry.productId,
      quantity: clampQuantity(entry.quantity),
      selections,
      note: typeof entry.note === "string" ? entry.note.slice(0, MAX_NOTE_LENGTH) : undefined,
      addedAt: typeof entry.addedAt === "number" ? entry.addedAt : 0,
    });
  }
  return { items };
}

export const cartStore = createPersistentStore<CartState>("jamra:cart:v1", { items: [] }, parseCart);

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export interface LineInput {
  productId: string;
  selections: Selections;
  quantity: number;
  note?: string;
}

const cleanNote = (note?: string) => note?.trim().slice(0, MAX_NOTE_LENGTH) || undefined;

/** Adds a line, merging with an identical configuration. */
export function addToCart(input: LineInput) {
  const note = cleanNote(input.note);
  const key = lineKey(input.productId, input.selections, note);
  cartStore.setState((state) => {
    const existing = state.items.find((item) => lineKey(item.productId, item.selections, item.note) === key);
    if (existing) {
      return {
        items: state.items.map((item) =>
          item === existing ? { ...item, quantity: clampQuantity(item.quantity + input.quantity) } : item
        ),
      };
    }
    return {
      items: [
        ...state.items,
        {
          id: newId(),
          productId: input.productId,
          selections: input.selections,
          quantity: clampQuantity(input.quantity),
          note,
          addedAt: Date.now(),
        },
      ],
    };
  });
}

export function setLineQuantity(lineId: string, quantity: number) {
  cartStore.setState((state) => ({
    items: state.items.map((item) => (item.id === lineId ? { ...item, quantity: clampQuantity(quantity) } : item)),
  }));
}

/** Removes a line and returns what is needed to undo it. */
export function removeLine(lineId: string): { item: CartItem; index: number } | null {
  const index = cartStore.getState().items.findIndex((item) => item.id === lineId);
  if (index === -1) return null;
  const item = cartStore.getState().items[index];
  cartStore.setState((state) => ({ items: state.items.filter((entry) => entry.id !== lineId) }));
  return { item, index };
}

export function restoreLine(item: CartItem, index: number) {
  cartStore.setState((state) => {
    if (state.items.some((entry) => entry.id === item.id)) return state;
    const items = [...state.items];
    items.splice(Math.min(index, items.length), 0, item);
    return { items };
  });
}

/** Replaces a line's configuration; merges into a matching line if one exists. */
export function updateLine(lineId: string, input: LineInput) {
  const note = cleanNote(input.note);
  const key = lineKey(input.productId, input.selections, note);
  cartStore.setState((state) => {
    const twin = state.items.find(
      (item) => item.id !== lineId && lineKey(item.productId, item.selections, item.note) === key
    );
    if (twin) {
      return {
        items: state.items
          .filter((item) => item.id !== lineId)
          .map((item) => (item === twin ? { ...item, quantity: clampQuantity(item.quantity + input.quantity) } : item)),
      };
    }
    return {
      items: state.items.map((item) =>
        item.id === lineId
          ? { ...item, selections: input.selections, quantity: clampQuantity(input.quantity), note }
          : item
      ),
    };
  });
}

export function removeLinesForProducts(productIds: string[]) {
  const ids = new Set(productIds);
  cartStore.setState((state) => ({ items: state.items.filter((item) => !ids.has(item.productId)) }));
}

/** Drops lines whose product no longer exists in the catalog. */
export function pruneUnknownProducts(knownIds: Set<string>) {
  const { items } = cartStore.getState();
  if (items.every((item) => knownIds.has(item.productId))) return;
  cartStore.setState({ items: items.filter((item) => knownIds.has(item.productId)) });
}

export function clearCart() {
  cartStore.setState({ items: [] });
}
