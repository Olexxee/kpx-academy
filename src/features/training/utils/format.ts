import type { DeliveryMode } from "../types";

const LOCALE = "en-NG";

export const formatPrice = (
  value: number | string,
  currency = "NGN",
): string => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";

  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Unknown currency code — fall back to a plain number.
    return `${currency} ${amount.toLocaleString(LOCALE)}`;
  }
};

export const formatDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateRange = (
  start: string | null | undefined,
  end: string | null | undefined,
): string | null => {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s} – ${e}`;
  return s ?? e ?? null;
};

const DELIVERY_LABELS: Record<DeliveryMode, string> = {
  PHYSICAL: "In-person",
  ONLINE: "Online",
  HYBRID: "Hybrid",
};

export const formatDeliveryMode = (mode: DeliveryMode): string =>
  DELIVERY_LABELS[mode] ?? mode;
