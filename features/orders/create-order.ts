import type {
  Coupon,
  FulfillmentMethod,
  MenuData,
  Order,
  OrderErrorCode,
  OrderLine,
  OrderRequest,
  RestaurantInfo,
} from "@/types";
import { isRecord } from "@/lib/is-record";
import {
  clampQuantity,
  computeTotals,
  describeSelections,
  getMissingRequired,
  getRegularUnitPrice,
  getUnitPrice,
  MAX_NOTE_LENGTH,
  sanitizeSelections,
} from "@/features/cart/pricing";
import { deliveryFeeFor, deliveryMinimumFor } from "@/features/cart/delivery";
import { isValidEmail, isValidPhone, LIMITS, normalizePhone } from "@/features/checkout/validation";
import { couponMessage, findCoupon, validateCoupon } from "@/features/coupons/validate";
import { describeAvailableTimes, isOrderableAt } from "@/features/menu/availability";
import { getBranch, getOrderingState, isValidScheduledTime } from "@/features/restaurant/ordering";

/* Server-side order creation: validates the request and re-prices every
   line from the catalog. Client-sent prices and totals are never trusted. */

export class OrderError extends Error {
  constructor(
    public code: OrderErrorCode,
    message: string,
    public productIds?: string[]
  ) {
    super(message);
  }
}

const MAX_ORDER_LINES = 50;
const FULFILLMENTS: FulfillmentMethod[] = ["delivery", "pickup", "dine-in"];

const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export function parseOrderRequest(body: unknown): OrderRequest {
  const invalid = () => new OrderError("INVALID_REQUEST", "بيانات الطلب غير مكتملة.");
  if (!isRecord(body) || !Array.isArray(body.items) || !isRecord(body.customer)) throw invalid();
  if (body.items.length > MAX_ORDER_LINES) {
    throw new OrderError("INVALID_REQUEST", "الطلب يحتوي على عدد كبير جداً من الأصناف. تواصل معنا للطلبات الكبيرة.");
  }
  const items = body.items.filter(isRecord).map((item) => ({
    productId: str(item.productId, 80),
    quantity: typeof item.quantity === "number" ? item.quantity : 0,
    selections: isRecord(item.selections) ? (item.selections as OrderRequest["items"][number]["selections"]) : {},
    note: str(item.note, MAX_NOTE_LENGTH) || undefined,
  }));
  const fulfillment = FULFILLMENTS.find((f) => f === body.fulfillment);
  const payment = body.payment;
  if (!fulfillment || (payment !== "cash" && payment !== "card" && payment !== "wallet")) throw invalid();
  const address = isRecord(body.address)
    ? {
        zoneId: str(body.address.zoneId, 40),
        street: str(body.address.street, LIMITS.street),
        building: str(body.address.building, LIMITS.building),
        floor: str(body.address.floor, LIMITS.floor) || undefined,
        landmark: str(body.address.landmark, LIMITS.landmark) || undefined,
        driverNotes: str(body.address.driverNotes, LIMITS.driverNotes) || undefined,
      }
    : undefined;
  return {
    items,
    customer: {
      name: str(body.customer.name, LIMITS.name),
      phone: normalizePhone(str(body.customer.phone, 20)),
      email: str(body.customer.email, LIMITS.email) || undefined,
      notes: str(body.customer.notes, LIMITS.notes) || undefined,
    },
    fulfillment,
    branchId: str(body.branchId, 40) || undefined,
    address,
    table: str(body.table, 10) || undefined,
    scheduledFor: str(body.scheduledFor, 40) || undefined,
    couponCode: str(body.couponCode, 32) || undefined,
    payment,
  };
}

function orderNumber() {
  const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, "0");
  return `JM-${random.slice(-6)}`;
}

export function createOrder(
  request: OrderRequest,
  menu: MenuData,
  info: RestaurantInfo,
  couponList: Coupon[],
  now: Date
): Order {
  if (request.items.length === 0) throw new OrderError("EMPTY_CART", "السلة فارغة.");

  // Order type
  if (!info.fulfillment[request.fulfillment]) {
    throw new OrderError("UNSUPPORTED_METHOD", "طريقة الاستلام هذه غير متاحة حالياً.");
  }
  if (request.fulfillment === "dine-in" && !request.table) {
    throw new OrderError("INVALID_REQUEST", "رقم الطاولة مطلوب للطلب داخل المطعم. امسح رمز QR على طاولتك.");
  }

  // Delivery area decides the branch for delivery orders.
  const zone =
    request.fulfillment === "delivery" ? info.deliveryZones.find((z) => z.id === request.address?.zoneId) : undefined;
  if (request.fulfillment === "delivery" && (!zone || !request.address?.street || !request.address.building)) {
    throw new OrderError("DELIVERY_UNAVAILABLE", "عنوان التوصيل غير مكتمل أو المنطقة خارج نطاق التوصيل.");
  }
  const branch = getBranch(info, zone?.branchId ?? request.branchId);
  if (request.branchId && !zone && branch.id !== request.branchId) {
    throw new OrderError("INVALID_REQUEST", "الفرع المختار غير موجود.");
  }

  // Timing: now, or a valid scheduled slot.
  const ordering = getOrderingState(info, branch, now);
  if (request.scheduledFor) {
    if (request.fulfillment === "dine-in" || !isValidScheduledTime(info, branch, request.scheduledFor, now)) {
      throw new OrderError("INVALID_SCHEDULE", "الوقت المختار غير متاح. اختر وقتاً آخر ضمن ساعات العمل.");
    }
  } else if (!ordering.canOrderNow) {
    const message =
      ordering.reason === "closed"
        ? "المطعم مغلق حالياً. يمكنك جدولة طلبك لوقت لاحق."
        : "استقبال الطلبات متوقف مؤقتاً. حاول بعد قليل.";
    throw new OrderError(ordering.reason === "closed" ? "RESTAURANT_CLOSED" : "ORDERING_PAUSED", message);
  }

  const payment = info.paymentMethods.find((method) => method.id === request.payment);
  if (!payment?.enabled) throw new OrderError("UNSUPPORTED_METHOD", "طريقة الدفع هذه غير متاحة حالياً.");

  const { customer } = request;
  if (!customer.name || customer.name.length < 2 || !isValidPhone(customer.phone)) {
    throw new OrderError("INVALID_REQUEST", "تحقق من الاسم ورقم الهاتف.");
  }
  if (customer.email && !isValidEmail(customer.email)) {
    throw new OrderError("INVALID_REQUEST", "البريد الإلكتروني غير صحيح.");
  }

  // Lines, re-priced from the catalog.
  const productsById = new Map(menu.products.map((p) => [p.id, p]));
  const unavailable: string[] = [];
  const lines: OrderLine[] = [];
  // Time-limited items (breakfast…) must be available when the order is prepared.
  const preparedAt = request.scheduledFor ? new Date(request.scheduledFor) : now;
  for (const item of request.items) {
    const product = productsById.get(item.productId);
    if (!product || !product.available) {
      unavailable.push(item.productId);
      continue;
    }
    if (!isOrderableAt(product, info.timeZone, preparedAt)) {
      throw new OrderError(
        "ITEM_UNAVAILABLE",
        `${product.name} متوفر فقط ${describeAvailableTimes(product)}. احذفه أو اختر وقتاً آخر.`,
        [product.id]
      );
    }
    const selections = sanitizeSelections(product, item.selections);
    if (getMissingRequired(product, selections).length > 0) {
      throw new OrderError("INVALID_OPTIONS", `اختر الخيارات المطلوبة لـ ${product.name}.`, [product.id]);
    }
    const quantity = clampQuantity(item.quantity);
    const unitPrice = getUnitPrice(product, selections);
    lines.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      quantity,
      unitPrice,
      regularUnitPrice: getRegularUnitPrice(product, selections),
      total: unitPrice * quantity,
      options: describeSelections(product, selections),
      selections,
      note: item.note,
    });
  }
  if (unavailable.length > 0) {
    throw new OrderError("ITEM_UNAVAILABLE", "بعض الأصناف لم تعد متوفرة.", unavailable);
  }

  const items = computeTotals(lines);

  if (request.fulfillment === "delivery") {
    const minimum = deliveryMinimumFor(info, zone);
    if (minimum && items.itemsTotal < minimum) {
      throw new OrderError("BELOW_MINIMUM", `الحد الأدنى لطلبات التوصيل إلى ${zone!.name} هو ${minimum} ₪.`);
    }
  }

  // Coupon, validated against server-computed totals.
  let couponDiscount = 0;
  let freeDeliveryCoupon = false;
  let coupon: Order["coupon"];
  if (request.couponCode) {
    const couponLines = lines.map((line) => ({
      categoryId: productsById.get(line.productId)!.categoryId,
      total: line.total,
    }));
    const result = validateCoupon(couponList, request.couponCode, couponLines, now);
    if (!result.ok) {
      const message = couponMessage(result, findCoupon(couponList, request.couponCode), menu.categories);
      throw new OrderError("INVALID_COUPON", message);
    }
    couponDiscount = result.discount;
    freeDeliveryCoupon = result.freeDelivery;
    coupon = { code: result.coupon.code, description: result.coupon.description };
  }

  const deliveryFee = zone ? deliveryFeeFor(info, zone, items.itemsTotal, freeDeliveryCoupon) : 0;
  const total = Math.max(0, Math.round((items.itemsTotal - couponDiscount + deliveryFee) * 100) / 100);

  return {
    id: crypto.randomUUID(),
    number: orderNumber(),
    createdAt: now.toISOString(),
    status: "received",
    customer,
    fulfillment: request.fulfillment,
    branchId: branch.id,
    address: zone && request.address ? { ...request.address, zoneName: zone.name } : undefined,
    table: request.fulfillment === "dine-in" ? request.table : undefined,
    scheduledFor: request.scheduledFor,
    coupon,
    payment: request.payment,
    // No online payment provider: every order is paid on receipt.
    paymentStatus: "unpaid",
    lines,
    totals: {
      subtotal: items.subtotal,
      discount: items.discount,
      couponDiscount,
      deliveryFee,
      total,
    },
  };
}
