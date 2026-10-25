// Formats a number with Persian (Farsi) digits and grouping.
export function faNum(value, options) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '۰';
  return n.toLocaleString('fa-IR', options);
}

// Prices are stored as minor units; the storefront displays them in Toman with
// Persian digits. Calculation logic is untouched — only the display format.
export function money(cents, symbol = 'تومان') {
  const n = Number(cents || 0) / 100;
  return `${faNum(n, { maximumFractionDigits: 2 })} ${symbol}`;
}

export function formatDate(value) {
  if (!value) return '';
  try {
    // fa-IR uses the Persian (Jalali) calendar in modern browsers.
    return new Date(value).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'completed',
  'cancelled',
];

export const STATUS_LABELS = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأییدشده',
  preparing: 'در حال آماده‌سازی',
  ready_for_pickup: 'آماده تحویل حضوری',
  out_for_delivery: 'در حال ارسال',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
};

export const PAYMENT_LABELS = {
  unpaid: 'پرداخت‌نشده',
  paid: 'پرداخت‌شده',
  refunded: 'بازپرداخت‌شده',
};

export const STATUS_STYLES = {
  pending: 'bg-butter/70 text-cocoa',
  confirmed: 'bg-lavender/70 text-cocoa',
  preparing: 'bg-mint text-cocoa',
  ready_for_pickup: 'bg-mint text-cocoa',
  out_for_delivery: 'bg-blush text-cocoa',
  completed: 'bg-strawberry/40 text-cocoa',
  cancelled: 'bg-muted/20 text-muted',
};
