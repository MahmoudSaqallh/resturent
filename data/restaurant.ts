import type { Branch, RestaurantInfo } from "@/types";

/**
 * Restaurant profile.
 *
 * SAMPLE DATA — replace phone, WhatsApp, social links, address, hours,
 * zones, fees, thresholds and switches with the restaurant's real details
 * before launch. Every status, fee, minimum and option in the UI is derived
 * from this object, so nothing else needs to change.
 */

const mainBranch: Branch = {
  id: "main",
  name: "فرع الإرسال",
  address: "رام الله — شارع الإرسال، بجانب الدوار",
  phone: "+970590000000",
  phoneDisplay: "059 000 0000",
  mapsUrl: "https://maps.google.com/?q=Ramallah",
  image: "/images/menu/dining-evening.jpg",
  hours: [
    { day: 0, open: "11:00", close: "01:00" },
    { day: 1, open: "11:00", close: "01:00" },
    { day: 2, open: "11:00", close: "01:00" },
    { day: 3, open: "11:00", close: "01:00" },
    { day: 4, open: "11:00", close: "02:00" },
    { day: 5, open: "13:00", close: "02:00" },
    { day: 6, open: "11:00", close: "02:00" },
  ],
  acceptingOrders: true,
};

export const restaurant: RestaurantInfo = {
  name: "جمرة",
  nameLatin: "JAMRA",
  tagline: "برغر ودجاج على الجمر",
  description: "مطبخ سريع يشوي على الجمر كل يوم: برغر، دجاج، بيتزا ومشروبات طازجة بتحضير على الطلب.",
  // The first branch is the main one; its details double as the brand's contact info.
  phone: mainBranch.phone,
  phoneDisplay: mainBranch.phoneDisplay,
  whatsapp: "970590000000",
  instagram: "https://www.instagram.com/",
  social: { instagram: "https://www.instagram.com/" },
  address: mainBranch.address,
  mapsUrl: mainBranch.mapsUrl,
  timeZone: "Asia/Hebron",
  hours: mainBranch.hours,
  acceptOrdersWhenClosed: false,
  fulfillment: { delivery: true, pickup: true, "dine-in": true },
  // Add more branches here; branch choice and /branches appear automatically with 2+.
  branches: [mainBranch],
  // load: "normal" | "high" | "very-high" — set only from the kitchen or a backend.
  operations: { manualClosed: false },
  scheduling: { enabled: true, leadMinutes: 45, slotMinutes: 30, daysAhead: 2 },
  deliveryZones: [
    { id: "center", name: "وسط البلد", fee: 7 },
    { id: "al-tireh", name: "الطيرة", fee: 10 },
    { id: "al-masyoun", name: "الماصيون", fee: 10 },
    { id: "al-bireh", name: "البيرة", fee: 12 },
    { id: "beitunia", name: "بيتونيا", fee: 15, minimumOrder: 50 },
  ],
  deliveryMinimum: 30,
  freeDeliveryOver: 100,
  paymentMethods: [
    { id: "cash", label: "الدفع عند الاستلام", description: "نقداً للسائق أو عند الكاونتر", enabled: true },
    // Card and wallet stay disabled until a real payment provider is connected.
    { id: "card", label: "بطاقة", description: "فيزا أو ماستركارد", enabled: false },
    { id: "wallet", label: "محفظة إلكترونية", description: "الدفع عبر المحفظة", enabled: false },
  ],
  // Customer programmes need accounts and a backend; each stays off until both exist.
  programs: {
    loyalty: { enabled: false },
    referral: { enabled: false },
    giftCards: { enabled: false },
    wallet: { enabled: false },
    groupOrders: { enabled: false },
    backInStockAlerts: { enabled: false },
  },
  services: {
    // Large orders are handled by phone/WhatsApp. Add `catering` or `reservations` only if offered.
    largeOrders: { enabled: true },
  },
  // Add the restaurant's own cancellation/delivery wording here; pages fall back to "contact us".
  policies: {},
};
