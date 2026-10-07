import { createStore, useStore } from "@/lib/store";

export type ToastTone = "success" | "info" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
  duration: number;
}

const MAX_TOASTS = 3;
let nextId = 1;

export const toastStore = createStore<Toast[]>([]);

export function showToast(
  message: string,
  options: { tone?: ToastTone; action?: Toast["action"]; duration?: number } = {}
) {
  const toast: Toast = {
    id: nextId++,
    message,
    tone: options.tone ?? "success",
    action: options.action,
    duration: options.duration ?? (options.action ? 5000 : 2800),
  };
  // Same message replaces the previous one instead of stacking duplicates.
  toastStore.setState((toasts) => [...toasts.filter((t) => t.message !== message), toast].slice(-MAX_TOASTS));
  return toast.id;
}

export function dismissToast(id: number) {
  toastStore.setState((toasts) => toasts.filter((toast) => toast.id !== id));
}

export function useToasts() {
  return useStore(toastStore, (toasts) => toasts);
}
