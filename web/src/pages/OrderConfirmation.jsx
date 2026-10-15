import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, PackageCheck } from 'lucide-react';
import { money, STATUS_LABELS } from '../lib/format.js';
import { useSite } from '../context/SiteContext.jsx';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const { symbol } = useSite();
  const order = state?.order;

  if (!order) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="h-display text-3xl">No recent order to show</h1>
        <p className="mt-3 text-sm text-muted">
          If you just placed an order, check your account for its details.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/shop" className="btn-dark">Browse the menu</Link>
          <Link to="/account" className="btn-ghost">My account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-14">
      <div className="card mx-auto max-w-3xl p-8 sm:p-10">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-mint">
          <CheckCircle2 className="h-7 w-7 text-cocoa" />
        </span>
        <h1 className="h-display mt-5 text-3xl sm:text-4xl">Thank you — your order is in</h1>
        <p className="mt-3 text-sm text-muted">
          Order <span className="font-semibold text-cocoa">{order.order_number}</span> · status{' '}
          <span className="font-semibold text-cocoa">{STATUS_LABELS[order.status] || order.status}</span>
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-3xl bg-butter/60 p-4 text-sm text-cocoa/80">
          <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
          <p>
            This order is recorded as <strong>unpaid</strong> because a payment provider is not connected yet.
            We will confirm your order and payment details by email.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="label">Fulfilment</h2>
            <p className="text-sm text-cocoa">
              {order.fulfillment === 'pickup' ? 'Pickup in store' : 'Local delivery'}
            </p>
            {order.address && (
              <p className="text-sm text-muted">
                {order.address}
                {order.city ? `, ${order.city}` : ''} {order.postal_code || ''}
              </p>
            )}
            {order.delivery_date && (
              <p className="text-sm text-muted">
                {new Date(order.delivery_date).toLocaleDateString()} · {order.time_slot}
              </p>
            )}
          </div>
          <div>
            <h2 className="label">Contact</h2>
            <p className="text-sm text-cocoa">{order.customer_name}</p>
            <p className="text-sm text-muted">{order.email}</p>
            {order.phone && <p className="text-sm text-muted">{order.phone}</p>}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="label">Items</h2>
          <ul className="divide-y divide-cocoa/10">
            {order.items.map((i) => (
              <li key={`${i.productId}-${i.variantLabel}`} className="flex items-center gap-4 py-3">
                <img src={i.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-cocoa">{i.name}</p>
                  <p className="text-xs text-muted">
                    {i.quantity} × {money(i.unitPriceCents, symbol)}
                    {i.variantLabel ? ` · ${i.variantLabel}` : ''}
                  </p>
                </div>
                <p className="text-sm font-semibold">{money(i.lineTotalCents, symbol)}</p>
              </li>
            ))}
          </ul>
        </div>

        <dl className="mt-6 space-y-2 border-t border-cocoa/10 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(order.subtotal_cents, symbol)}</dd></div>
          {order.discount_cents > 0 && (
            <div className="flex justify-between text-rose"><dt>Discount</dt><dd>−{money(order.discount_cents, symbol)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.delivery_fee_cents === 0 ? 'Free' : money(order.delivery_fee_cents, symbol)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{money(order.tax_cents, symbol)}</dd></div>
          <div className="flex justify-between border-t border-cocoa/10 pt-3 text-base font-semibold"><dt>Total</dt><dd>{money(order.total_cents, symbol)}</dd></div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={`/order/${order.id}`} className="btn-dark">Track this order</Link>
          <Link to="/shop" className="btn-ghost">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
