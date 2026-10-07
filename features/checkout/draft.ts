import { isRecord } from "@/lib/is-record";
import { createPersistentStore } from "@/lib/store";

/**
 * Contact details and recent delivery addresses for this browser session,
 * so a second order in the same visit needs no retyping. There are no
 * customer accounts: nothing is kept after the tab closes, and nothing is
 * sent anywhere except with an order.
 */
export type AddressLabel = "home" | "work" | "other";

export const ADDRESS_LABELS: Record<AddressLabel, string> = { home: "البيت", work: "الشغل", other: "عنوان آخر" };

export interface SavedAddress {
  label: AddressLabel;
  zoneId: string;
  street: string;
  building: string;
  floor: string;
  landmark: string;
}

export interface CheckoutDraft {
  name: string;
  phone: string;
  email: string;
  addresses: SavedAddress[];
}

export const MAX_SAVED_ADDRESSES = 3;

export const EMPTY_DRAFT: CheckoutDraft = { name: "", phone: "", email: "", addresses: [] };

const text = (value: unknown) => (typeof value === "string" ? value.slice(0, 120) : "");

function parseAddress(raw: unknown): SavedAddress | null {
  if (!isRecord(raw)) return null;
  const label: AddressLabel = raw.label === "home" || raw.label === "work" ? raw.label : "other";
  const address = {
    label,
    zoneId: text(raw.zoneId),
    street: text(raw.street),
    building: text(raw.building),
    floor: text(raw.floor),
    landmark: text(raw.landmark),
  };
  return address.zoneId && address.street && address.building ? address : null;
}

function parseDraft(raw: unknown): CheckoutDraft | null {
  if (!isRecord(raw)) return null;
  const addresses = Array.isArray(raw.addresses)
    ? raw.addresses.map(parseAddress).filter((a): a is SavedAddress => a !== null).slice(0, MAX_SAVED_ADDRESSES)
    : [];
  return { name: text(raw.name), phone: text(raw.phone), email: text(raw.email), addresses };
}

// Earlier versions kept details in localStorage; remove them so nothing outlives the session.
if (typeof window !== "undefined") {
  try {
    window.localStorage.removeItem("jamra:checkout:v1");
  } catch {
    // Storage blocked: nothing to clean up.
  }
}

export const checkoutDraftStore = createPersistentStore<CheckoutDraft>(
  "jamra:checkout:v2",
  EMPTY_DRAFT,
  parseDraft,
  "session"
);

const sameAddress = (a: SavedAddress, b: SavedAddress) =>
  a.zoneId === b.zoneId && a.street === b.street && a.building === b.building && a.floor === b.floor;

/** One address per label for البيت/الشغل; the latest one used becomes the default (first). */
const replaces = (existing: SavedAddress, next: SavedAddress) =>
  sameAddress(existing, next) || (next.label !== "other" && existing.label === next.label);

export function rememberCheckout(contact: Pick<CheckoutDraft, "name" | "phone" | "email">, address?: SavedAddress) {
  checkoutDraftStore.setState((draft) => ({
    ...contact,
    addresses: address
      ? [address, ...draft.addresses.filter((a) => !replaces(a, address))].slice(0, MAX_SAVED_ADDRESSES)
      : draft.addresses,
  }));
}

export function forgetAddress(address: SavedAddress) {
  checkoutDraftStore.setState((draft) => ({
    ...draft,
    addresses: draft.addresses.filter((a) => !sameAddress(a, address)),
  }));
}
