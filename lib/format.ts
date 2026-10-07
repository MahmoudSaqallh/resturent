const priceFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** "28 ₪" — Western digits; a no-break space keeps the amount and ₪ on one line. */
export function formatPrice(value: number) {
  return `${priceFormat.format(value)} ₪`;
}

interface PluralForms {
  /** "عنصر واحد" */
  one: string;
  /** "عنصران" */
  two: string;
  /** 3–10: "عناصر" */
  few: string;
  /** 11+: "عنصراً" */
  many: string;
}

/** Arabic counted noun: 1 → one, 2 → two, 3–10 → "n few", 11+ → "n many". */
export function pluralize(count: number, forms: PluralForms) {
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  const mod100 = count % 100;
  if (mod100 >= 3 && mod100 <= 10) return `${count} ${forms.few}`;
  return `${count} ${forms.many}`;
}

export const ITEM_FORMS: PluralForms = {
  one: "عنصر واحد",
  two: "عنصران",
  few: "عناصر",
  many: "عنصراً",
};

export const MEAL_FORMS: PluralForms = {
  one: "وجبة واحدة",
  two: "وجبتان",
  few: "وجبات",
  many: "وجبة",
};

export const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

/** "23:30" → "11:30 م" */
export function formatClock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "ص" : "م";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDateTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("ar", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
    numberingSystem: "latn",
  }).format(new Date(iso));
}
