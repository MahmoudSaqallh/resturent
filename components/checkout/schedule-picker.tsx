"use client";

import { CalendarClock, Zap } from "lucide-react";
import type { ScheduleSlot } from "@/features/restaurant/ordering";
import { Field, Select } from "@/components/ui/field";
import { ChoiceCard } from "./choice-card";

interface SchedulePickerProps {
  slots: ScheduleSlot[];
  /** Ordering "as soon as possible" is possible right now. */
  canOrderNow: boolean;
  nowNote?: string;
  value: string | null;
  onChange: (iso: string | null) => void;
}

/**
 * "في أقرب وقت" or a later slot. Slots come from the working hours,
 * lead time and any pause, so every listed time is one the kitchen accepts.
 */
export function SchedulePicker({ slots, canOrderNow, nowNote, value, onChange }: SchedulePickerProps) {
  const selected = slots.find((slot) => slot.iso === value) ?? null;
  const later = selected !== null;
  const days = [...new Map(slots.map((slot) => [slot.dayKey, slot.dayLabel])).entries()];
  const daySlots = selected ? slots.filter((slot) => slot.dayKey === selected.dayKey) : [];

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="وقت الطلب" className="grid gap-3 sm:grid-cols-2">
        <ChoiceCard
          name="timing"
          value="now"
          checked={!later}
          disabled={!canOrderNow}
          onChange={() => onChange(null)}
          icon={<Zap className="size-5" />}
          title="في أقرب وقت"
          description={canOrderNow ? nowNote : "غير متاح الآن"}
        />
        {slots.length > 0 && (
          <ChoiceCard
            name="timing"
            value="later"
            checked={later}
            onChange={() => onChange(slots[0].iso)}
            icon={<CalendarClock className="size-5" />}
            title="جدولة لوقت لاحق"
            description="ضمن ساعات العمل"
          />
        )}
      </div>

      {selected && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="checkout-day" label="اليوم">
            <Select
              id="checkout-day"
              value={selected.dayKey}
              onChange={(event) => {
                const first = slots.find((slot) => slot.dayKey === event.target.value);
                if (first) onChange(first.iso);
              }}
            >
              {days.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="checkout-time" label="الوقت">
            <Select id="checkout-time" value={selected.iso} onChange={(event) => onChange(event.target.value)}>
              {daySlots.map((slot) => (
                <option key={slot.iso} value={slot.iso}>
                  {slot.timeLabel}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}
    </div>
  );
}
