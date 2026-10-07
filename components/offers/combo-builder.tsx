"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import type { OptionChoice, Product, ProductOption, Selections } from "@/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { DURATION, EASE, gsap, MOTION_OK_QUERY, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { COMBO_BUILDER_ID } from "@/data/ids";
import { useCatalog } from "@/features/menu/catalog";
import { addToCart } from "@/features/cart/store";
import { notifyAdded } from "@/features/cart/actions";
import {
  getMissingRequired,
  getRegularUnitPrice,
  getUnitPrice,
  isChoiceAvailable,
  withDefaults,
} from "@/features/cart/pricing";
import { SectionHeading } from "@/components/ui/section-heading";
import { AnimatedPrice } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { FoodImage } from "@/components/products/food-image";

/** Short step names for the progress bar. */
const stepLabel = (option: ProductOption) => option.name.replace(/^اختر\s+/, "");

/** Product choices carry a full price; modifiers carry a delta. */
function choicePrice(choice: OptionChoice) {
  if (choice.productId) return formatPrice(choice.priceDelta);
  return choice.priceDelta > 0 ? `+ ${formatPrice(choice.priceDelta)}` : "مشمول";
}

function Indicator({ checked, multiple, className }: { checked: boolean; multiple: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center transition-colors",
        multiple ? "rounded-md" : "rounded-full",
        checked ? "bg-ink text-cream" : "bg-white/90 text-transparent ring-1 ring-line-strong",
        className
      )}
    >
      <Check className="size-4" strokeWidth={3} />
    </span>
  );
}

function ChoiceTile({
  option,
  choice,
  checked,
  disabled,
  image,
  onToggle,
}: {
  option: ProductOption;
  choice: OptionChoice;
  checked: boolean;
  disabled: boolean;
  image?: string;
  onToggle: () => void;
}) {
  const available = isChoiceAvailable(choice);
  const multiple = option.selection === "multiple";
  return (
    <label
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-surface ring-1 transition-[box-shadow] duration-150",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
        checked ? "ring-2 ring-ink" : "ring-line hover:ring-ink-muted",
        !available || disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
    >
      <input
        type={multiple ? "checkbox" : "radio"}
        name={`combo-${option.id}`}
        value={choice.id}
        checked={checked}
        disabled={!available || disabled}
        onChange={onToggle}
        className="sr-only"
      />
      {image && (
        <FoodImage
          src={image}
          alt=""
          sizes="(min-width: 1024px) 180px, 45vw"
          className="aspect-4/3 w-full"
          imageClassName="transition-transform duration-500 group-hover:scale-103"
        />
      )}
      <span className={cn("flex justify-between gap-2 p-3", image ? "items-start" : "min-h-16 items-center")}>
        <span className="text-sm leading-snug font-bold">
          {choice.label}
          {!available && <span className="block text-xs font-normal text-ink-muted">غير متوفر حالياً</span>}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="tabular text-sm font-semibold whitespace-nowrap text-ink-muted">{choicePrice(choice)}</span>
          {/* Text-only tiles keep the indicator in the row; photo tiles overlay it on the image. */}
          {!image && <Indicator checked={checked} multiple={multiple} />}
        </span>
      </span>
      {image && <Indicator checked={checked} multiple={multiple} className="absolute end-2 top-2" />}
    </label>
  );
}

export function ComboBuilder() {
  const { productsById } = useCatalog();
  const combo = productsById.get(COMBO_BUILDER_ID);
  if (!combo?.options?.length) return null;
  return <Builder combo={combo} options={combo.options} productsById={productsById} />;
}

function Builder({
  combo,
  options,
  productsById,
}: {
  combo: Product;
  options: ProductOption[];
  productsById: Map<string, Product>;
}) {
  const [selections, setSelections] = useState<Selections>(() => withDefaults(combo));
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(0);
  // Furthest step reached; optional steps before it count as done (skipped or chosen).
  const [reached, setReached] = useState(0);
  const directionRef = useRef(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const movedRef = useRef(false);

  const option = options[step];
  const last = step === options.length - 1;
  const missing = getMissingRequired(combo, selections);
  const complete = missing.length === 0;
  const regular = getRegularUnitPrice(combo, selections) * quantity;
  // The bundle saving applies to a complete meal; until then show the running sum.
  const total = complete ? getUnitPrice(combo, selections) * quantity : regular;
  const picked = selections[option.id] ?? [];
  const stepSatisfied = !option.required || picked.length > 0;
  const isDone = (index: number) => {
    const o = options[index];
    // Only visited steps show as done, even when a default choice is preselected.
    return index <= reached && (!o.required || Boolean(selections[o.id]?.length));
  };
  // A step is reachable when every required step before it has a choice.
  const canOpen = (index: number) => options.slice(0, index).every((o) => !o.required || selections[o.id]?.length);

  // Step transition: content slides in from the direction of travel (RTL: forward = from the left).
  useGSAP(
    () => {
      if (!movedRef.current) return;
      legendRef.current?.focus({ preventScroll: true });
      // Keep the current step visible in the horizontally scrolling progress bar.
      const strip = progressRef.current;
      const current = strip?.querySelector<HTMLElement>("[aria-current=step]");
      if (strip && current) {
        // Relative scroll works the same in RTL, where scrollLeft runs negative.
        const a = current.getBoundingClientRect();
        const b = strip.getBoundingClientRect();
        const delta = a.left + a.width / 2 - (b.left + b.width / 2);
        strip.scrollBy({ left: delta, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.from("[data-step-content]", {
          x: -24 * directionRef.current,
          autoAlpha: 0,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: 0.04,
        });
      });
    },
    { scope: panelRef, dependencies: [step] }
  );

  const goTo = (index: number) => {
    if (index === step || index < 0 || index >= options.length || !canOpen(index)) return;
    directionRef.current = index > step ? 1 : -1;
    movedRef.current = true;
    setStep(index);
    setReached((current) => Math.max(current, index));
    if (panelRef.current && panelRef.current.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panelRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };

  const toggle = (choiceId: string) => {
    setSelections((current) => {
      const now = current[option.id] ?? [];
      if (option.selection === "single") {
        // Optional single choices can be cleared by choosing them again.
        const next = !option.required && now[0] === choiceId ? [] : [choiceId];
        return { ...current, [option.id]: next };
      }
      const next = now.includes(choiceId) ? now.filter((id) => id !== choiceId) : [...now, choiceId];
      return { ...current, [option.id]: next };
    });
  };

  const add = () => {
    if (!complete) {
      goTo(options.indexOf(missing[0]));
      return;
    }
    addToCart({ productId: combo.id, selections, quantity });
    notifyAdded(combo.name);
    movedRef.current = true;
    directionRef.current = -1;
    setSelections(withDefaults(combo));
    setQuantity(1);
    setStep(0);
    setReached(0);
  };

  const primaryEnabled = last ? complete : stepSatisfied;
  const primaryLabel = last
    ? "أضف الوجبة للسلة"
    : !stepSatisfied
      ? `اختر ${stepLabel(option)}`
      : !option.required && picked.length === 0
        ? "تخطي"
        : "التالي";
  const onPrimary = () => {
    if (last) add();
    else if (stepSatisfied) goTo(step + 1);
  };
  const max = option.selection === "multiple" ? (option.maxSelections ?? option.choices.length) : 1;

  return (
    <div className="container-page py-8 md:py-12">
      <SectionHeading
        as="h1"
        eyebrow="وجبة على ذوقك"
        title="كوّن وجبتك"
        description={`${options.length} خطوات بسيطة، ونخصم ${formatPrice(combo.bundleDiscount ?? 0)} من مجموع الوجبة.`}
      />

      {/* Progress */}
      <nav ref={progressRef} aria-label="خطوات بناء الوجبة" className="relative mt-6 -mx-4 overflow-x-auto px-4 scrollbar-none">
        <ol className="flex min-w-max gap-2">
          {options.map((o, index) => {
            const done = isDone(index) && index !== step;
            const current = index === step;
            const reachable = canOpen(index);
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  disabled={!reachable}
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full ps-1.5 pe-3.5 text-sm font-semibold transition-colors",
                    current ? "bg-ink text-cream" : "bg-surface ring-1 ring-line",
                    !current && reachable && "hover:ring-ink-muted",
                    !reachable && "text-ink-muted"
                  )}
                >
                  <span
                    className={cn(
                      "tabular flex size-7 items-center justify-center rounded-full text-xs",
                      current ? "bg-cream text-ink" : done ? "bg-success text-white" : "bg-cream-deep"
                    )}
                  >
                    {done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : index + 1}
                  </span>
                  {stepLabel(o)}
                  {done && <span className="sr-only">(مكتمل)</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div ref={panelRef} className="scroll-mt-[calc(var(--header-h)+1rem)]">
          <fieldset key={option.id} aria-describedby="step-help">
            <legend className="sr-only">{option.name}</legend>
            <div data-step-content className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 ref={legendRef} tabIndex={-1} className="text-xl font-extrabold outline-none md:text-2xl">
                <span className="tabular text-ink-muted">
                  {step + 1}/{options.length}
                </span>{" "}
                {option.name}
              </h2>
              <p id="step-help" className="text-sm text-ink-muted">
                {option.required
                  ? "مطلوب"
                  : option.selection === "multiple"
                    ? `اختياري · حتى ${max}`
                    : "اختياري"}
              </p>
            </div>
            <div data-step-content className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {option.choices.map((choice) => {
                const checked = picked.includes(choice.id);
                return (
                  <ChoiceTile
                    key={choice.id}
                    option={option}
                    choice={choice}
                    checked={checked}
                    disabled={!checked && option.selection === "multiple" && picked.length >= max}
                    image={choice.productId ? productsById.get(choice.productId)?.image : undefined}
                    onToggle={() => toggle(choice.id)}
                  />
                );
              })}
            </div>
          </fieldset>
          {step > 0 && (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="mt-5 inline-flex h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
              السابق: {stepLabel(options[step - 1])}
            </button>
          )}
        </div>

        {/* Summary: side panel on desktop, sticky bottom bar on phones. */}
        <aside
          aria-label="ملخص الوجبة"
          className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-cream px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:top-[calc(var(--header-h)+1.5rem)] lg:bottom-auto lg:mx-0 lg:rounded-xl lg:border-0 lg:bg-surface lg:p-5 lg:ring-1 lg:ring-line"
        >
          <h2 className="text-lg font-bold max-lg:hidden">وجبتك</h2>
          <ol className="mt-3 flex flex-col gap-2 max-lg:hidden">
            {options.map((o, index) => {
              const chosen = o.choices.filter((c) => selections[o.id]?.includes(c.id));
              return (
                <li key={o.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className={chosen.length ? "font-semibold" : "text-ink-muted"}>
                    {chosen.length ? chosen.map((c) => c.label).join("، ") : `${index + 1}. ${stepLabel(o)}`}
                  </span>
                  {chosen.length > 0 && (
                    <span className="tabular shrink-0 text-ink-muted">
                      {formatPrice(chosen.reduce((sum, c) => sum + c.priceDelta, 0))}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          {complete && regular > total && (
            <p className="mt-3 flex items-center justify-between rounded-md bg-success-tint px-3 py-2 text-sm font-bold text-success max-lg:hidden">
              <span>وفّرت</span>
              <span className="tabular">{formatPrice(regular - total)}</span>
            </p>
          )}

          <div className="flex items-center gap-3 lg:mt-4 lg:flex-col lg:items-stretch">
            <div className="flex flex-1 flex-col lg:flex-row lg:items-center lg:justify-between">
              <span className="text-xs text-ink-muted lg:text-sm lg:font-bold lg:text-ink">
                {complete ? "المجموع" : "السعر حتى الآن"}
              </span>
              <AnimatedPrice amount={total} className="text-xl font-extrabold lg:text-2xl" />
            </div>
            {last && (
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                size="md"
                itemLabel={combo.name}
                className="max-lg:hidden lg:self-center"
              />
            )}
            <button
              type="button"
              onClick={onPrimary}
              aria-disabled={!primaryEnabled}
              className={cn(
                "inline-flex h-13 items-center justify-center gap-2 rounded-full px-6 text-base font-bold transition-[background-color,transform] duration-150 active:scale-98",
                primaryEnabled ? "bg-brand text-white hover:bg-brand-hover" : "cursor-not-allowed bg-ink/10 text-ink-muted"
              )}
            >
              {last && <Plus className="size-5" strokeWidth={2.5} aria-hidden="true" />}
              {primaryLabel}
              {!last && primaryEnabled && <ArrowLeft className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
