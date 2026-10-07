"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Banknote,
  Bike,
  CircleAlert,
  Clock,
  CreditCard,
  MapPin,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Wallet,
  WifiOff,
  X,
} from "lucide-react";
import type { FulfillmentMethod, PaymentMethodId } from "@/types";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useHydrated, useStore } from "@/lib/store";
import { useOnline } from "@/lib/use-online";
import { clearCart, removeLinesForProducts } from "@/features/cart/store";
import {
  ADDRESS_LABELS,
  checkoutDraftStore,
  forgetAddress,
  rememberCheckout,
  type AddressLabel,
  type SavedAddress,
} from "@/features/checkout/draft";
import {
  FIELD_ORDER,
  LIMITS,
  toAddress,
  toCustomer,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutForm,
} from "@/features/checkout/validation";
import { availableFulfillments, setFulfillment, setOrdering } from "@/features/ordering/store";
import { useOrderPricing } from "@/features/ordering/use-pricing";
import { submitOrder } from "@/features/orders/client";
import { saveOrder } from "@/features/orders/store";
import { getBranch } from "@/features/restaurant/ordering";
import { describeBlock, useOrderingState, useScheduleSlots } from "@/features/restaurant/use-status";
import { openCart } from "@/features/ui/overlays";
import { useGoToMenu } from "@/features/menu/use-go-to-menu";
import { showToast } from "@/features/toasts/store";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { describedBy, Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { AnimatedPrice } from "@/components/ui/price";
import { contactLinks } from "@/components/ui/brand";
import { FoodImage } from "@/components/products/food-image";
import { CartSummary, FreeDeliveryProgress } from "@/components/cart/cart-summary";
import { ChoiceCard } from "./choice-card";
import { CouponField } from "./coupon-field";
import { SchedulePicker } from "./schedule-picker";

const PAYMENT_ICONS: Record<PaymentMethodId, ReactNode> = {
  cash: <Banknote className="size-5" />,
  card: <CreditCard className="size-5" />,
  wallet: <Wallet className="size-5" />,
};

const FULFILLMENT_CARDS: Record<FulfillmentMethod, { icon: ReactNode; title: string; description: string }> = {
  delivery: { icon: <Bike className="size-5" />, title: "توصيل", description: "الرسوم حسب المنطقة" },
  pickup: { icon: <Store className="size-5" />, title: "استلام من المطعم", description: "بدون رسوم توصيل" },
  "dine-in": { icon: <UtensilsCrossed className="size-5" />, title: "داخل المطعم", description: "نحضر الطلب لطاولتك" },
};

const zoneIds = restaurant.deliveryZones.map((zone) => zone.id);
const enabledPayments = restaurant.paymentMethods.filter((method) => method.enabled);
const multipleBranches = restaurant.branches.length > 1;

type Details = Omit<CheckoutForm, "fulfillment" | "zoneId">;

function initialDetails(): Details {
  const draft = checkoutDraftStore.getState();
  const recent = draft.addresses[0];
  return {
    name: draft.name,
    phone: draft.phone,
    email: draft.email,
    notes: "",
    street: recent?.street ?? "",
    building: recent?.building ?? "",
    floor: recent?.floor ?? "",
    landmark: recent?.landmark ?? "",
    driverNotes: "",
    payment: enabledPayments[0]?.id ?? "cash",
  };
}

function Step({ index, title, children }: { index: number; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`step-${index}`} className="rounded-xl bg-surface p-4 ring-1 ring-line md:p-6">
      <h2 id={`step-${index}`} className="mb-4 flex items-center gap-3 text-lg font-bold">
        <span className="tabular flex size-8 items-center justify-center rounded-full bg-ink text-sm text-cream">
          {index}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_24rem]" aria-busy="true" aria-label="جارٍ التحميل">
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-48 rounded-xl" />
        ))}
      </div>
      <div className="skeleton h-96 rounded-xl" />
    </div>
  );
}

export function CheckoutView() {
  const hydrated = useHydrated();
  if (!hydrated) return <CheckoutSkeleton />;
  return <CheckoutForm />;
}

function CheckoutForm() {
  const router = useRouter();
  const goToMenu = useGoToMenu();
  const online = useOnline();
  const pricing = useOrderPricing();
  const { summary, session } = pricing;
  const savedAddresses = useStore(checkoutDraftStore, (draft) => draft.addresses);
  const [details, setDetails] = useState<Details>(initialDetails);
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string; productIds?: string[] } | null>(null);
  const submittingRef = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const { fulfillment } = session;
  const delivery = fulfillment === "delivery";
  const dineIn = fulfillment === "dine-in";
  const branch = getBranch(restaurant, pricing.zone?.branchId ?? session.branchId);
  const ordering = useOrderingState(branch.id);
  const slots = useScheduleSlots(branch.id);
  const methods = availableFulfillments(session.table);

  const form: CheckoutForm = { ...details, fulfillment, zoneId: session.zoneId };
  const errors: CheckoutErrors = validateCheckout(form, zoneIds);
  const visibleError = (field: CheckoutField) => (touched[field] ? errors[field] : undefined);

  // A stored slot may have passed since it was picked; treat it as not chosen.
  const scheduledFor = !dineIn && slots.some((slot) => slot.iso === session.scheduledFor) ? session.scheduledFor : null;
  const canOrderNow = ordering?.canOrderNow ?? true;
  const timingBlocked = !scheduledFor && !canOrderNow;
  const hasUnavailable = summary.lines.some((line) => line.unavailable);
  const couponChecking = pricing.coupon.status === "checking";
  const blocked = timingBlocked || pricing.belowMinimum || hasUnavailable || !online;

  const update = <K extends keyof Details>(field: K, value: Details[K]) => {
    setDetails((current) => ({ ...current, [field]: value }));
    if (submitError) setSubmitError(null);
  };
  const touch = (field: CheckoutField) => setTouched((current) => ({ ...current, [field]: true }));
  const [addressLabel, setAddressLabel] = useState<AddressLabel>(
    () => checkoutDraftStore.getState().addresses[0]?.label ?? "home"
  );
  const fillSaved = (address: SavedAddress) => {
    setAddressLabel(address.label);
    setOrdering({ zoneId: address.zoneId });
    setDetails((current) => ({
      ...current,
      street: address.street,
      building: address.building,
      floor: address.floor,
      landmark: address.landmark,
    }));
  };

  if (summary.lines.length === 0 && !placed) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<ShoppingBag className="size-7" />}
          title="سلتك لسه فاضية 🍔"
          description="أضف وجباتك أولاً، ثم ارجع لإتمام الطلب."
          action={
            <Button size="lg" onClick={() => goToMenu()}>
              استعرض المنيو
            </Button>
          }
        />
      </div>
    );
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submittingRef.current || blocked || couponChecking) return;

    const invalid = FIELD_ORDER.filter((field) => errors[field]);
    if (invalid.length > 0) {
      setTouched((current) => ({ ...current, ...Object.fromEntries(invalid.map((f) => [f, true])) }));
      document.getElementById(`checkout-${invalid[0]}`)?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitOrder({
      items: summary.lines.map(({ item }) => ({
        productId: item.productId,
        quantity: item.quantity,
        selections: item.selections,
        note: item.note,
      })),
      customer: toCustomer(form),
      fulfillment,
      branchId: branch.id,
      address: toAddress(form),
      table: dineIn ? (session.table ?? undefined) : undefined,
      scheduledFor: scheduledFor ?? undefined,
      couponCode: pricing.couponToSend,
      payment: details.payment,
    });
    submittingRef.current = false;

    if (!result.ok) {
      setSubmitting(false);
      if (result.code === "INVALID_SCHEDULE") setOrdering({ scheduledFor: null });
      setSubmitError({
        message: result.message,
        productIds: result.code === "ITEM_UNAVAILABLE" ? result.productIds : undefined,
      });
      showToast("لم يتم إرسال الطلب", { tone: "error" });
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    const address = toAddress(form);
    rememberCheckout(
      { name: details.name.trim(), phone: details.phone.trim(), email: details.email.trim() },
      address
        ? {
            label: addressLabel,
            zoneId: address.zoneId,
            street: address.street,
            building: address.building,
            floor: address.floor ?? "",
            landmark: address.landmark ?? "",
          }
        : undefined
    );
    saveOrder(result.order);
    setPlaced(true);
    clearCart();
    setOrdering({ couponCode: null, scheduledFor: null });
    router.replace(`/orders/${result.order.id}?new=1`);
  };

  if (placed) {
    return (
      <div className="container-page py-16" role="status">
        <EmptyState title="جارٍ فتح صفحة الطلب…" description="تم استلام طلبك." compact />
      </div>
    );
  }

  const confirmLabel = submitting
    ? "جارٍ إرسال الطلب…"
    : !online
      ? "لا يوجد اتصال"
      : scheduledFor
        ? "تأكيد الطلب المجدول"
        : "تأكيد الطلب";
  const submitDisabled = submitting || blocked || couponChecking;
  const eta = delivery && pricing.zone?.etaMinutes ? pricing.zone.etaMinutes : restaurant.prepTimeMinutes;
  const nowNote = eta ? `حوالي ${eta} دقيقة` : "نبدأ التحضير فور التأكيد";

  return (
    <form noValidate onSubmit={onSubmit} className="container-page py-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h1 className="text-2xl font-extrabold md:text-3xl">إتمام الطلب</h1>
        <p className="text-sm text-ink-muted">إتمام الطلب كضيف — لا حاجة لإنشاء حساب.</p>
      </div>

      {!online && (
        <p role="alert" className="mt-4 flex items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-cream">
          <WifiOff className="size-5 shrink-0" aria-hidden="true" />
          أنت غير متصل بالإنترنت. سلتك وبياناتك محفوظة، أكمل الطلب عند عودة الاتصال.
        </p>
      )}
      {ordering && !canOrderNow && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-mustard-tint px-4 py-3 text-sm font-semibold">
          <Clock className="size-5 shrink-0" aria-hidden="true" />
          {describeBlock(ordering)}
          {slots.length > 0 && !dineIn ? " يمكنك جدولة طلبك لوقت لاحق." : " سلتك محفوظة."}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="flex flex-col gap-4">
          <Step index={1} title="بيانات العميل">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="checkout-name" label="الاسم" error={visibleError("name")}>
                <TextInput
                  id="checkout-name"
                  name="name"
                  autoComplete="name"
                  value={details.name}
                  maxLength={LIMITS.name}
                  onChange={(e) => update("name", e.target.value)}
                  onBlur={() => touch("name")}
                  invalid={Boolean(visibleError("name"))}
                  aria-describedby={describedBy("checkout-name", visibleError("name"))}
                />
              </Field>
              <Field id="checkout-phone" label="رقم الهاتف" hint="سنتصل بك فقط بخصوص هذا الطلب." error={visibleError("phone")}>
                <TextInput
                  id="checkout-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="059 123 4567"
                  value={details.phone}
                  maxLength={20}
                  onChange={(e) => update("phone", e.target.value)}
                  onBlur={() => touch("phone")}
                  invalid={Boolean(visibleError("phone"))}
                  aria-describedby={describedBy("checkout-phone", visibleError("phone"), "hint")}
                  className="text-right"
                />
              </Field>
              <Field id="checkout-email" label="البريد الإلكتروني" optional error={visibleError("email")}>
                <TextInput
                  id="checkout-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
                  value={details.email}
                  maxLength={LIMITS.email}
                  onChange={(e) => update("email", e.target.value)}
                  onBlur={() => touch("email")}
                  invalid={Boolean(visibleError("email"))}
                  aria-describedby={describedBy("checkout-email", visibleError("email"))}
                  className="text-right"
                />
              </Field>
              <Field id="checkout-notes" label="ملاحظات على الطلب" optional>
                <TextInput
                  id="checkout-notes"
                  name="notes"
                  maxLength={LIMITS.notes}
                  placeholder="مثلاً: بدون بصل في كل الساندويشات"
                  value={details.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </Field>
            </div>
          </Step>

          <Step index={2} title="نوع الطلب">
            <div
              role="radiogroup"
              aria-label="نوع الطلب"
              className={methods.length === 3 ? "grid gap-3 sm:grid-cols-3" : "grid gap-3 sm:grid-cols-2"}
            >
              {methods.map((method) => (
                <ChoiceCard
                  key={method}
                  name="fulfillment"
                  value={method}
                  checked={fulfillment === method}
                  onChange={() => setFulfillment(method)}
                  icon={FULFILLMENT_CARDS[method].icon}
                  title={FULFILLMENT_CARDS[method].title}
                  description={
                    method === "dine-in" && session.table ? `طاولة ${session.table}` : FULFILLMENT_CARDS[method].description
                  }
                />
              ))}
            </div>
          </Step>

          <Step index={3} title={delivery ? "عنوان التوصيل" : dineIn ? "طاولتك" : "فرع الاستلام"}>
            {delivery ? (
              <div className="flex flex-col gap-4">
                {savedAddresses.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold">عناوينك في هذه الزيارة</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {savedAddresses.map((address) => {
                        const zone = restaurant.deliveryZones.find((z) => z.id === address.zoneId);
                        const label = [zone?.name, address.street, address.building].filter(Boolean).join("، ");
                        return (
                          <li key={label} className="flex items-center rounded-full ring-1 ring-line-strong">
                            <button
                              type="button"
                              onClick={() => fillSaved(address)}
                              className="flex h-10 items-center gap-1.5 ps-3.5 pe-2 text-sm font-medium"
                            >
                              <MapPin className="size-4 text-brand" aria-hidden="true" />
                              <span className="font-bold">{ADDRESS_LABELS[address.label]}</span>
                              <span className="max-w-[12rem] truncate text-ink-soft">{label}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => forgetAddress(address)}
                              aria-label={`حذف العنوان: ${label}`}
                              className="flex size-10 items-center justify-center rounded-full text-ink-muted hover:text-ink"
                            >
                              <X className="size-4" aria-hidden="true" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="checkout-zoneId" label="المنطقة" error={visibleError("zoneId")} className="sm:col-span-2">
                    <Select
                      id="checkout-zoneId"
                      name="zone"
                      value={session.zoneId}
                      onChange={(e) => {
                        setOrdering({ zoneId: e.target.value });
                        touch("zoneId");
                      }}
                      onBlur={() => touch("zoneId")}
                      invalid={Boolean(visibleError("zoneId"))}
                      aria-describedby={describedBy("checkout-zoneId", visibleError("zoneId"))}
                    >
                      <option value="" disabled>
                        اختر منطقتك
                      </option>
                      {restaurant.deliveryZones.map((z) => {
                        const minimum = z.minimumOrder ?? restaurant.deliveryMinimum;
                        return (
                          <option key={z.id} value={z.id}>
                            {z.name} — توصيل {formatPrice(z.fee)}
                            {minimum ? ` · حد أدنى ${formatPrice(minimum)}` : ""}
                            {z.etaMinutes ? ` · حوالي ${z.etaMinutes} د` : ""}
                          </option>
                        );
                      })}
                    </Select>
                  </Field>
                  <Field id="checkout-street" label="الشارع" error={visibleError("street")}>
                    <TextInput
                      id="checkout-street"
                      name="street"
                      autoComplete="address-line1"
                      value={details.street}
                      maxLength={LIMITS.street}
                      onChange={(e) => update("street", e.target.value)}
                      onBlur={() => touch("street")}
                      invalid={Boolean(visibleError("street"))}
                      aria-describedby={describedBy("checkout-street", visibleError("street"))}
                    />
                  </Field>
                  <Field id="checkout-building" label="المبنى" hint="رقم أو اسم العمارة" error={visibleError("building")}>
                    <TextInput
                      id="checkout-building"
                      name="building"
                      autoComplete="address-line2"
                      value={details.building}
                      maxLength={LIMITS.building}
                      onChange={(e) => update("building", e.target.value)}
                      onBlur={() => touch("building")}
                      invalid={Boolean(visibleError("building"))}
                      aria-describedby={describedBy("checkout-building", visibleError("building"), "hint")}
                    />
                  </Field>
                  <Field id="checkout-floor" label="رقم الطابق" optional>
                    <TextInput
                      id="checkout-floor"
                      name="floor"
                      inputMode="numeric"
                      value={details.floor}
                      maxLength={LIMITS.floor}
                      onChange={(e) => update("floor", e.target.value)}
                    />
                  </Field>
                  <Field id="checkout-landmark" label="علامة مميزة" optional>
                    <TextInput
                      id="checkout-landmark"
                      name="landmark"
                      placeholder="مثلاً: مقابل الصيدلية"
                      value={details.landmark}
                      maxLength={LIMITS.landmark}
                      onChange={(e) => update("landmark", e.target.value)}
                    />
                  </Field>
                  <fieldset className="sm:col-span-2">
                    <legend className="text-sm font-semibold">احفظ العنوان باسم</legend>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {(Object.keys(ADDRESS_LABELS) as AddressLabel[]).map((key) => (
                        <label
                          key={key}
                          className={cn(
                            "flex h-10 cursor-pointer items-center rounded-full px-4 text-sm font-semibold ring-1 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-brand",
                            addressLabel === key ? "bg-ink text-cream ring-ink" : "ring-line-strong hover:ring-ink-muted"
                          )}
                        >
                          <input
                            type="radio"
                            name="address-label"
                            value={key}
                            checked={addressLabel === key}
                            onChange={() => setAddressLabel(key)}
                            className="sr-only"
                          />
                          {ADDRESS_LABELS[key]}
                        </label>
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-ink-muted">يُحفظ على هذا الجهاز خلال هذه الزيارة فقط.</p>
                  </fieldset>
                  <Field id="checkout-driverNotes" label="ملاحظات للسائق" optional className="sm:col-span-2">
                    <TextArea
                      id="checkout-driverNotes"
                      name="driverNotes"
                      rows={2}
                      placeholder="مثلاً: اتصل عند الوصول"
                      value={details.driverNotes}
                      maxLength={LIMITS.driverNotes}
                      onChange={(e) => update("driverNotes", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            ) : dineIn ? (
              <p className="flex items-center gap-3 rounded-lg bg-cream p-4 ring-1 ring-line">
                <UtensilsCrossed className="size-5 shrink-0 text-brand" aria-hidden="true" />
                <span>
                  <span className="block font-bold">طاولة {session.table}</span>
                  <span className="block text-sm text-ink-muted">سنحضر طلبك إلى طاولتك في {branch.name}.</span>
                </span>
              </p>
            ) : multipleBranches ? (
              <div role="radiogroup" aria-label="فرع الاستلام" className="grid gap-3 sm:grid-cols-2">
                {restaurant.branches.map((b) => (
                  <ChoiceCard
                    key={b.id}
                    name="branch"
                    value={b.id}
                    checked={branch.id === b.id}
                    disabled={!b.acceptingOrders}
                    onChange={() => setOrdering({ branchId: b.id })}
                    icon={<Store className="size-5" />}
                    title={b.name}
                    description={b.acceptingOrders ? b.address : "لا يستقبل طلبات حالياً"}
                  />
                ))}
              </div>
            ) : (
              <a
                href={branch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg bg-cream p-4 ring-1 ring-line hover:ring-ink-muted"
              >
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <span>
                  <span className="block font-bold">
                    {restaurant.name} — {branch.name}
                  </span>
                  <span className="block text-sm text-ink-muted">{branch.address}</span>
                  <span className="mt-1 block text-sm font-semibold underline underline-offset-2">افتح الخريطة</span>
                </span>
              </a>
            )}
          </Step>

          <Step index={4} title="وقت الطلب">
            {dineIn ? (
              <p className="text-sm text-ink-soft">طلبات الطاولة تُحضَّر فوراً بعد التأكيد.</p>
            ) : (
              <SchedulePicker
                slots={restaurant.scheduling.enabled ? slots : []}
                canOrderNow={canOrderNow}
                nowNote={nowNote}
                value={scheduledFor}
                onChange={(iso) => setOrdering({ scheduledFor: iso })}
              />
            )}
          </Step>

          <Step index={5} title="طريقة الدفع">
            <div role="radiogroup" aria-label="طريقة الدفع" className="grid gap-3 sm:grid-cols-2">
              {enabledPayments.map((method) => (
                <ChoiceCard
                  key={method.id}
                  name="payment"
                  value={method.id}
                  checked={details.payment === method.id}
                  onChange={() => update("payment", method.id)}
                  icon={PAYMENT_ICONS[method.id]}
                  title={method.label}
                  description={method.description}
                />
              ))}
            </div>
            {enabledPayments.length === 1 && (
              <p className="mt-3 text-xs text-ink-muted">الدفع الإلكتروني غير متاح حالياً.</p>
            )}
          </Step>
        </div>

        <aside aria-labelledby="review-title" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <section className="rounded-xl bg-surface p-4 ring-1 ring-line md:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="review-title" className="flex items-center gap-3 text-lg font-bold">
                <span className="tabular flex size-8 items-center justify-center rounded-full bg-ink text-sm text-cream">6</span>
                مراجعة الطلب
              </h2>
              <button type="button" onClick={openCart} className="h-11 text-sm font-semibold underline underline-offset-4">
                تعديل السلة
              </button>
            </div>
            <ul className="divide-y divide-line">
              {summary.lines.map((line) => (
                <li key={line.item.id} className="flex gap-3 py-3">
                  <FoodImage src={line.product.image} alt="" sizes="48px" className="size-12 shrink-0 rounded-sm" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="flex justify-between gap-2 font-bold">
                      <span>
                        <span className="tabular text-ink-muted">{line.item.quantity}×</span> {line.product.name}
                      </span>
                      <span className="tabular shrink-0">{formatPrice(line.total)}</span>
                    </p>
                    {line.options.length > 0 && <p className="mt-0.5 text-xs text-ink-muted">{line.options.join(" · ")}</p>}
                    {line.item.note && <p className="mt-0.5 text-xs text-ink-soft">ملاحظة: {line.item.note}</p>}
                    {line.unavailable && <p className="mt-0.5 text-xs font-semibold text-danger">غير متوفر حالياً</p>}
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line py-3">
              <CouponField preview={pricing.coupon} />
            </div>

            {delivery && (
              <FreeDeliveryProgress
                remaining={pricing.freeRemaining}
                threshold={restaurant.freeDeliveryOver}
                className="border-t border-line py-3"
              />
            )}

            <CartSummary
              className="border-t border-line pt-4"
              subtotal={summary.subtotal}
              discount={summary.discount}
              couponDiscount={pricing.couponDiscount}
              couponCode={pricing.couponToSend}
              deliveryFee={pricing.deliveryFee}
              deliveryNote={delivery && pricing.deliveryFee === null ? "اختر منطقة التوصيل لحساب الرسوم." : undefined}
              total={pricing.total}
            />

            {pricing.belowMinimum && pricing.minimum !== undefined && (
              <p className="mt-3 text-sm font-semibold text-danger">
                الحد الأدنى لطلبات التوصيل{pricing.zone ? ` إلى ${pricing.zone.name}` : ""} {formatPrice(pricing.minimum)}.
                أضف {formatPrice(pricing.minimum - summary.itemsTotal)} أو اختر الاستلام من المطعم.
              </p>
            )}
            {hasUnavailable && (
              <p className="mt-3 text-sm font-semibold text-danger">بعض الأصناف غير متوفرة حالياً. احذفها من السلة للمتابعة.</p>
            )}

            {submitError && (
              <div
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="mt-4 rounded-lg bg-danger-tint p-3.5 text-sm text-danger outline-none"
              >
                <p className="flex items-start gap-2 font-semibold">
                  <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {submitError.message}
                </p>
                {submitError.productIds && submitError.productIds.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      removeLinesForProducts(submitError.productIds ?? []);
                      setSubmitError(null);
                    }}
                    className="mt-2 h-10 rounded-md bg-danger px-3 font-bold text-white"
                  >
                    احذف الأصناف غير المتوفرة
                  </button>
                ) : (
                  <p className="mt-1 text-ink-soft">
                    إذا استمرت المشكلة، اطلب عبر{" "}
                    <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                      واتساب
                    </a>{" "}
                    أو{" "}
                    <a href={contactLinks.phone} className="font-semibold underline">
                      اتصل بنا
                    </a>
                    .
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitDisabled}
              className="mt-5 hidden h-14 w-full items-center justify-between rounded-full bg-brand px-6 text-base font-bold text-white transition-[background-color,transform] duration-150 hover:bg-brand-hover active:scale-98 disabled:bg-ink-muted lg:flex"
            >
              {confirmLabel}
              <AnimatedPrice amount={pricing.total} className="font-extrabold" />
            </button>
            {details.payment === "cash" && (
              <p className="mt-3 hidden text-center text-xs text-ink-muted lg:block">تدفع عند استلام الطلب.</p>
            )}
          </section>
        </aside>
      </div>

      {/* Phones: confirm bar always within thumb reach. */}
      <div className="h-24 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
        <button
          type="submit"
          disabled={submitDisabled}
          className="flex h-14 w-full items-center justify-between rounded-full bg-brand px-6 text-base font-bold text-white transition-transform active:scale-98 disabled:bg-ink-muted"
        >
          {confirmLabel}
          <AnimatedPrice amount={pricing.total} className="font-extrabold" />
        </button>
      </div>
    </form>
  );
}
