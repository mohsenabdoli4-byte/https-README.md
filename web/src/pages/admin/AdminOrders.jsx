import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api, qs } from '../../lib/api.js';
import { money, formatDate, STATUS_LABELS, STATUS_STYLES, ORDER_STATUSES } from '../../lib/format.js';
import { useSite } from '../../context/SiteContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminOrders() {
  const { symbol } = useSite();
  const { success, error } = useToast();
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: '', q: '' });
  const [selected, setSelected] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const load = () => api.get(`/admin/orders${qs(filters)}`).then((d) => setOrders(d.orders || []));

  useEffect(() => {
    load();
  }, [filters]);

  const update = async (id, patch) => {
    try {
      const res = await api.patch(`/admin/orders/${id}`, patch);
      setOrders((o) => o.map((x) => (x.id === id ? res.order : x)));
      if (selected?.id === id) setSelected(res.order);
      success('Order updated.');
    } catch (err) {
      error(err.message);
    }
  };

  const remove = async (o) => {
    if (!window.confirm(`Delete order ${o.order_number}? This cannot be undone.`)) return;
    try {
      await api.del(`/admin/orders/${o.id}`);
      setOrders((list) => list.filter((x) => x.id !== o.id));
      if (selected?.id === o.id) setSelected(null);
      success('Order deleted.');
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div>
      <h1 className="h-display text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-muted">Manage fulfilment and payment status.</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          placeholder="Search order number or email…"
          className="field max-w-xs"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="field max-w-[200px]"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="mt-5 card overflow-x-auto p-2">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Fulfilment</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa/10">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="p-3">
                  <p className="font-medium text-cocoa">{o.order_number}</p>
                  <p className="text-xs text-muted">{formatDate(o.created_at)}</p>
                </td>
                <td className="p-3">
                  <p className="text-cocoa">{o.customer_name || '—'}</p>
                  <p className="text-xs text-muted">{o.email}</p>
                </td>
                <td className="p-3 text-muted">
                  {o.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}
                  {o.delivery_date && <span className="block text-xs">{new Date(o.delivery_date).toLocaleDateString()}</span>}
                </td>
                <td className="p-3">
                  <select
                    value={o.payment_status}
                    onChange={(e) => update(o.id, { paymentStatus: e.target.value })}
                    className="rounded-xl border border-cocoa/15 bg-white px-2 py-1 text-xs"
                  >
                    <option value="unpaid">unpaid</option>
                    <option value="paid">paid</option>
                    <option value="refunded">refunded</option>
                  </select>
                </td>
                <td className="p-3">
                  <select
                    value={o.status}
                    onChange={(e) => update(o.id, { status: e.target.value })}
                    className="rounded-xl border border-cocoa/15 bg-white px-2 py-1 text-xs"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-right font-semibold">{money(o.total_cents, symbol)}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setSelected(o)} className="text-xs font-semibold text-rose hover:underline">
                      View
                    </button>
                    <button
                      onClick={() => remove(o)}
                      aria-label={`Delete order ${o.order_number}`}
                      className="text-muted hover:text-rose"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted">No orders match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-cocoa/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-4xl bg-cream p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold">{selected.order_number}</h2>
                <span className={`chip mt-2 ${STATUS_STYLES[selected.status] || 'bg-blush'}`}>
                  {STATUS_LABELS[selected.status]}
                </span>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close">✕</button>
            </div>

            <div className="mt-5 space-y-1 text-sm text-muted">
              <p className="text-cocoa">{selected.customer_name}</p>
              <p>{selected.email}</p>
              {selected.phone && <p>{selected.phone}</p>}
              <p className="pt-2">{selected.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</p>
              {selected.address && <p>{selected.address}, {selected.city} {selected.postal_code}</p>}
              {selected.delivery_date && <p>{new Date(selected.delivery_date).toLocaleDateString()} · {selected.time_slot}</p>}
              {selected.instructions && <p>Notes: {selected.instructions}</p>}
            </div>

            <ul className="mt-5 divide-y divide-cocoa/10 text-sm">
              {selected.items.map((i) => (
                <li key={`${i.productId}-${i.variantLabel}`} className="flex justify-between py-2">
                  <span>
                    {i.quantity} × {i.name}
                    {i.variantLabel ? ` · ${i.variantLabel}` : ''}
                  </span>
                  <span className="font-semibold">{money(i.lineTotalCents, symbol)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1 border-t border-cocoa/10 pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(selected.subtotal_cents, symbol)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{money(selected.delivery_fee_cents, symbol)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{money(selected.tax_cents, symbol)}</dd></div>
              <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{money(selected.total_cents, symbol)}</dd></div>
            </dl>

            <div className="mt-5">
              <label htmlFor="cancel-reason" className="label">Cancellation reason</label>
              <input
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="field"
                placeholder="Only needed when cancelling"
              />
              <button
                onClick={() => update(selected.id, { status: 'cancelled', cancelReason })}
                className="btn-ghost mt-3"
              >
                Mark as cancelled
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
