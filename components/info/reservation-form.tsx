"use client";

import { useState, type FormEvent } from "react";
import { restaurant } from "@/data/restaurant";
import { isValidPhone } from "@/features/checkout/validation";
import { Field, Select, TextInput } from "@/components/ui/field";
import { whatsappLink, WhatsAppIcon } from "@/components/ui/brand";
import { buttonClasses } from "@/components/ui/button";

/**
 * Table request sent to the restaurant over WhatsApp. It is a request, not a
 * confirmed booking: the restaurant replies to confirm. No backend is faked.
 */
export function ReservationForm({ maxPartySize }: { maxPartySize: number }) {
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", party: "2" });
  const [error, setError] = useState<string | null>(null);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: restaurant.timeZone }).format(new Date());

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2 || !isValidPhone(form.phone) || !form.date || !form.time) {
      setError("أكمل الاسم ورقم جوال صحيح والتاريخ والوقت.");
      return;
    }
    setError(null);
    const text = [
      "مرحباً، أريد حجز طاولة:",
      `- الاسم: ${form.name.trim()}`,
      `- الجوال: ${form.phone.trim()}`,
      `- التاريخ: ${form.date}`,
      `- الوقت: ${form.time}`,
      `- عدد الأشخاص: ${form.party}`,
    ].join("\n");
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
  };

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field id="res-name" label="الاسم">
        <TextInput id="res-name" autoComplete="name" value={form.name} onChange={(e) => set("name")(e.target.value)} />
      </Field>
      <Field id="res-phone" label="رقم الجوال">
        <TextInput
          id="res-phone"
          type="tel"
          dir="ltr"
          autoComplete="tel"
          className="text-right"
          value={form.phone}
          onChange={(e) => set("phone")(e.target.value)}
        />
      </Field>
      <Field id="res-date" label="التاريخ">
        <TextInput id="res-date" type="date" min={today} value={form.date} onChange={(e) => set("date")(e.target.value)} />
      </Field>
      <Field id="res-time" label="الوقت">
        <TextInput id="res-time" type="time" value={form.time} onChange={(e) => set("time")(e.target.value)} />
      </Field>
      <Field id="res-party" label="عدد الأشخاص">
        <Select id="res-party" value={form.party} onChange={(e) => set("party")(e.target.value)}>
          {Array.from({ length: maxPartySize }, (_, i) => String(i + 1)).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </Field>
      {error && (
        <p role="alert" className="text-sm font-semibold text-danger sm:col-span-2">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" className={buttonClasses({ size: "lg" })}>
          <WhatsAppIcon size={18} />
          أرسل طلب الحجز
        </button>
        <p className="mt-2 text-xs text-ink-muted">يصلك تأكيد الحجز من المطعم على واتساب.</p>
      </div>
    </form>
  );
}
