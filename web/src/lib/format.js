export function money(cents, symbol = '$') {
  const n = Number(cents || 0) / 100;
  return `${symbol}${n.toFixed(2)}`;
}

export function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
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
