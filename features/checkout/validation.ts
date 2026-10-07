import type { Address, Customer, FulfillmentMethod, PaymentMethodId } from "@/types";

export interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  notes: string;
  fulfillment: FulfillmentMethod;
  zoneId: string;
  street: string;
  building: string;
  floor: string;
  landmark: string;
  driverNotes: string;
  payment: PaymentMethodId;
}

export type CheckoutField = keyof CheckoutForm;
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

/** Local mobile numbers: 05XXXXXXXX, or +970/+972 5XXXXXXXX. */
export function normalizePhone(input: string) {
  const digits = input
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^\d+]/g, "");
  return digits.replace(/^00/, "+");
}

export function isValidPhone(input: string) {
  return /^(?:\+97[02]|0)5\d{8}$/.test(normalizePhone(input));
}

export function isValidEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());
}

export const LIMITS = {
  name: 60,
  email: 120,
  notes: 200,
  street: 100,
  building: 60,
  floor: 20,
  landmark: 100,
  driverNotes: 200,
} as const;

/** Field rules, in the order fields appear (first error gets focus). */
export function validateField(field: CheckoutField, form: CheckoutForm, zoneIds: string[]): string | undefined {
  const delivery = form.fulfillment === "delivery";
  switch (field) {
    case "name":
      if (form.name.trim().length < 2) return "اكتب اسمك حتى نعرف لمن الطلب.";
      return undefined;
    case "phone":
      if (!form.phone.trim()) return "نحتاج رقم هاتفك للتواصل بخصوص الطلب.";
      if (!isValidPhone(form.phone)) return "اكتب رقم جوال صحيح، مثل 0591234567.";
      return undefined;
    case "email":
      if (form.email.trim() && !isValidEmail(form.email)) return "اكتب بريداً إلكترونياً صحيحاً، أو اتركه فارغاً.";
      return undefined;
    case "zoneId":
      if (delivery && !zoneIds.includes(form.zoneId)) return "اختر منطقة التوصيل.";
      return undefined;
    case "street":
      if (delivery && form.street.trim().length < 2) return "اكتب اسم الشارع.";
      return undefined;
    case "building":
      if (delivery && !form.building.trim()) return "اكتب رقم أو اسم المبنى.";
      return undefined;
    default:
      return undefined;
  }
}

export const FIELD_ORDER: CheckoutField[] = ["name", "phone", "email", "zoneId", "street", "building"];

export function validateCheckout(form: CheckoutForm, zoneIds: string[]): CheckoutErrors {
  const errors: CheckoutErrors = {};
  for (const field of FIELD_ORDER) {
    const message = validateField(field, form, zoneIds);
    if (message) errors[field] = message;
  }
  return errors;
}

export function toCustomer(form: CheckoutForm): Customer {
  return {
    name: form.name.trim().slice(0, LIMITS.name),
    phone: normalizePhone(form.phone),
    email: form.email.trim().slice(0, LIMITS.email) || undefined,
    notes: form.notes.trim().slice(0, LIMITS.notes) || undefined,
  };
}

export function toAddress(form: CheckoutForm): Address | undefined {
  if (form.fulfillment !== "delivery") return undefined;
  return {
    zoneId: form.zoneId,
    street: form.street.trim().slice(0, LIMITS.street),
    building: form.building.trim().slice(0, LIMITS.building),
    floor: form.floor.trim().slice(0, LIMITS.floor) || undefined,
    landmark: form.landmark.trim().slice(0, LIMITS.landmark) || undefined,
    driverNotes: form.driverNotes.trim().slice(0, LIMITS.driverNotes) || undefined,
  };
}
