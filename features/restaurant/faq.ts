import type { RestaurantInfo } from "@/types";
import { DAY_NAMES, formatClock, formatPrice } from "@/lib/format";

export interface FaqItem {
  question: string;
  answer: string;
}

const list = (items: string[]) => items.join("، ");

/**
 * FAQ answers generated from the restaurant's real settings, so they can
 * never drift from what checkout actually enforces. Questions about
 * features the restaurant does not offer are left out.
 */
export function buildFaq(info: RestaurantInfo): FaqItem[] {
  const faq: FaqItem[] = [];
  const main = info.branches[0];

  const week = [...main.hours]
    .sort((a, b) => ((a.day + 1) % 7) - ((b.day + 1) % 7))
    .map((h) => `${DAY_NAMES[h.day]} ${formatClock(h.open)} – ${formatClock(h.close)}`);
  faq.push({ question: "ما هي ساعات العمل؟", answer: `${week.join("، ")}.` });

  if (info.fulfillment.delivery && info.deliveryZones.length > 0) {
    faq.push({
      question: "إلى أي مناطق توصلون؟ وكم رسوم التوصيل؟",
      answer: `نوصل إلى: ${list(info.deliveryZones.map((z) => `${z.name} (${formatPrice(z.fee)})`))}. رسوم منطقتك تظهر عند إتمام الطلب قبل التأكيد.`,
    });
    const special = info.deliveryZones.filter((z) => z.minimumOrder !== undefined);
    if (info.deliveryMinimum !== undefined || special.length > 0) {
      const parts: string[] = [];
      if (info.deliveryMinimum !== undefined) parts.push(`الحد الأدنى لطلبات التوصيل ${formatPrice(info.deliveryMinimum)}`);
      for (const zone of special) parts.push(`إلى ${zone.name} ${formatPrice(zone.minimumOrder!)}`);
      faq.push({
        question: "هل يوجد حد أدنى للطلب؟",
        answer: `${list(parts)}. لا يوجد حد أدنى لطلبات الاستلام${info.fulfillment["dine-in"] ? " أو داخل المطعم" : ""}.`,
      });
    }
    if (info.freeDeliveryOver !== undefined) {
      faq.push({
        question: "هل التوصيل مجاني؟",
        answer: `التوصيل مجاني للطلبات من ${formatPrice(info.freeDeliveryOver)} فأكثر (قبل رسوم التوصيل). يظهر لك في السلة كم باقي حتى تصل له.`,
      });
    }
  }

  if (info.fulfillment.pickup) {
    faq.push({
      question: "هل أستطيع استلام الطلب من المطعم؟",
      answer: `نعم، اختر «استلام» عند إتمام الطلب واستلمه من ${main.name}: ${main.address}.`,
    });
  }

  if (info.fulfillment["dine-in"]) {
    faq.push({
      question: "كيف أطلب وأنا داخل المطعم؟",
      answer: "امسح رمز QR الموجود على طاولتك. يفتح المنيو ويرتبط طلبك برقم الطاولة تلقائياً، ونحضره لك على الطاولة.",
    });
  }

  if (info.scheduling.enabled) {
    faq.push({
      question: "هل أستطيع جدولة طلبي لوقت لاحق؟",
      answer: `نعم، ضمن ساعات العمل وحتى ${info.scheduling.daysAhead === 1 ? "يوم" : `${info.scheduling.daysAhead} أيام`} مقدماً. أقرب موعد متاح بعد حوالي ${info.scheduling.leadMinutes} دقيقة من الآن.`,
    });
  }

  const payments = info.paymentMethods.filter((m) => m.enabled).map((m) => m.label);
  faq.push({ question: "ما طرق الدفع المتاحة؟", answer: `${list(payments)}.` });

  faq.push({
    question: "هل أحتاج إلى إنشاء حساب؟",
    answer: "لا. تطلب كضيف بالاسم ورقم الهاتف فقط، والبريد الإلكتروني اختياري.",
  });
  faq.push({
    question: "كيف أعرف حالة طلبي؟",
    answer: "بعد التأكيد يظهر لك رقم الطلب وتُحفظ تفاصيله على جهازك في «طلباتي». لمعرفة الحالة أو تعديل الطلب تواصل معنا برقم الطلب عبر الهاتف أو واتساب.",
  });
  faq.push({
    question: "هل أستطيع تعديل طلبي أو إلغاءه؟",
    answer:
      info.policies.cancellation ??
      "تواصل معنا بأسرع وقت عبر الهاتف أو واتساب وأخبرنا برقم الطلب، وسنساعدك حسب مرحلة تحضيره.",
  });
  if (info.services.largeOrders.enabled) {
    faq.push({
      question: "هل تستقبلون طلبات للشركات والمناسبات؟",
      answer: info.services.catering
        ? `نعم، ونقدّم خدمة المناسبات (${info.services.catering.eventTypes.join("، ")}). تواصل معنا بالتفاصيل من صفحة «طلبات كبيرة».`
        : "نعم، تواصل معنا من صفحة «طلبات كبيرة» بعدد الأشخاص والموعد، ونتفق معك على الأصناف والسعر.",
    });
  }
  if (info.services.reservations) {
    faq.push({
      question: "هل يمكن حجز طاولة؟",
      answer: `نعم، حتى ${info.services.reservations.maxPartySize} أشخاص. أرسل طلب الحجز من صفحة «حجز طاولة» ونؤكده لك على واتساب.`,
    });
  }
  faq.push({
    question: "كيف أستخدم كود الخصم؟",
    answer: "اضغط «عندك كود خصم؟» في صفحة إتمام الطلب واكتب الكود. نتحقق منه ونعرض لك قيمة الخصم قبل التأكيد، وبعض الأكواد لها حد أدنى أو تاريخ انتهاء.",
  });
  faq.push({
    question: "عندي حساسية من بعض المكونات، ماذا أفعل؟",
    answer: "مكونات كل وجبة مكتوبة في صفحتها. إذا عندك حساسية، اتصل بنا قبل الطلب واكتبها في ملاحظات الطلب أيضاً.",
  });

  return faq;
}
