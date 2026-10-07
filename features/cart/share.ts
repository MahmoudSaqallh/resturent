import type { CartItem, Selections } from "@/types";
import { isRecord } from "@/lib/is-record";
import { clampQuantity, MAX_NOTE_LENGTH } from "./pricing";

/* Shareable cart links: the items travel in the URL fragment (never sent to
   the server), and the receiver re-checks everything against today's menu.
   No prices are included; they are always recomputed. */

const MAX_SHARED_LINES = 30;

export interface SharedLine {
  productId: string;
  quantity: number;
  selections: Selections;
  note?: string;
}

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export function encodeCart(items: CartItem[]) {
  const compact = items.slice(0, MAX_SHARED_LINES).map((item) => [item.productId, item.quantity, item.selections, item.note ?? ""]);
  return toBase64Url(JSON.stringify(compact));
}

export function sharedCartPath(items: CartItem[]) {
  return `/shared-cart#c=${encodeCart(items)}`;
}

/** Parses an untrusted fragment; returns null when it is not a valid shared cart. */
export function decodeCart(hash: string): SharedLine[] | null {
  const match = /(?:^#|&)c=([A-Za-z0-9_-]+)/.exec(hash);
  if (!match) return null;
  try {
    const data: unknown = JSON.parse(fromBase64Url(match[1]));
    if (!Array.isArray(data)) return null;
    const lines: SharedLine[] = [];
    for (const entry of data.slice(0, MAX_SHARED_LINES)) {
      if (!Array.isArray(entry) || typeof entry[0] !== "string" || !isRecord(entry[2])) continue;
      const selections: Selections = {};
      for (const [key, value] of Object.entries(entry[2])) {
        if (Array.isArray(value) && value.every((v) => typeof v === "string")) selections[key.slice(0, 40)] = value.slice(0, 10);
      }
      lines.push({
        productId: entry[0].slice(0, 80),
        quantity: clampQuantity(typeof entry[1] === "number" ? entry[1] : 1),
        selections,
        note: typeof entry[3] === "string" && entry[3] ? entry[3].slice(0, MAX_NOTE_LENGTH) : undefined,
      });
    }
    return lines.length > 0 ? lines : null;
  } catch {
    return null;
  }
}
