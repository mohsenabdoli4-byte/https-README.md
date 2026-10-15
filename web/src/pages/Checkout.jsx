import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Lock, Store, Truck } from 'lucide-react';
import { api } from '../lib/api.js';
import { money } from '../lib/format.js';
import { useCart } from '../context/CartContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const TIME_SLOTS = ['10:00 – 12:00', '12:00 – 14:00', '14:00 – 16:00', '16:00 – 18:00', '18:00 – 20:00'];

export default function Checkout() {
  const { items, subtotalCents, clear } = useCart();
  const { symbol, commerce } = useSite();
  const { user } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: user?.email || '',
    customerName: user?.fullName || '',
    phone: user?.phone || '',
    fulfillment: 'delivery',
    address: '',
    city: '',
    postalCode: '',
    instructions: '',
    deliveryDate: '',
    timeSlot: TIME_SLOTS[0],
    paymentMethod: 'test',
  });
  const [promoCode, setPromoCode] = useState(location.state?.promoCode || '');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const fee =
    form.fulfillment === 'pickup' || subtotalCents >= (commerce?.freeDeliveryThresholdCents || 0)
      ? 0
      : commerce?.deliveryFeeCents || 0;
  const tax = Math.round(subtotalCents * (commerce?.taxRate || 0));
  const total = subtotalCents + fee + tax;

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.customerName.trim()) e.customerName = 'Enter the name for the order.';
    if (form.fulfillment === 'delivery') {
      if (!form.address.trim()) e.address = 'Enter a delivery address.';
      if (!form.city.trim()) e.city = 'Enter a city.';
      if (!form.deliveryDate) e.deliveryDate = 'Choose a delivery date.';
    } else if (!form.deliveryDate) {
      e.deliveryDate = 'Choose a pickup date.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      error('Your bag is empty.');
      return;
    }
    if (!validate()) {
      error('Please fix the highlighted fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        ...form,
        promoCode: promoCode || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantLabel: i.variantLabel,
          flavor: i.flavor,
          quantity: i.quantity,
          customization: i.customization,
        })),
      });
      clear();
      success('Order placed. A confirmation is on its way.');
      navigate('/order-confirmation', { replace: true, state: { order: res.order, payment: res.payment } });
    } catch (err) {
      error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="h-display text-3xl">Nothing to check out</h1>
        <p className="mt-3 text-sm text-muted">Your bag is empty.</p>
        <Link to="/shop" className="btn-dark mt-6">
          Browse the menu
        </Link>
      </div>
    );
  }

  const minDate = new Date(Date.now() + (commerce?.leadTimeDays || 1) * 86400000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="container-x py-10">
      <h1 className="h-display text-4xl sm:text-5xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        Prices, discounts and availability are verified on our server when you place the order.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* 1 — Contact */}
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">1. Contact information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-email" className="label">Email</label>
                <input id="co-email" type="email" value={form.email} onChange={set('email')} className="field" />
                {errors.email && <p className="mt-1 text-xs text-rose">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="co-name" className="label">Full name</label>
                <input id="co-name" value={form.customerName} onChange={set('customerName')} className="field" />
                {errors.customerName && <p className="mt-1 text-xs text-rose">{errors.customerName}</p>}
              </div>
              <div>
                <label htmlFor="co-phone" className="label">Phone</label>
                <input id="co-phone" value={form.phone} onChange={set('phone')} className="field" />
              </div>
            </div>
          </section>

          {/* 2 — Fulfillment */}
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">2. Delivery or pickup</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, fulfillment: 'delivery' }))}
                className={`flex items-center gap-3 rounded-3xl border p-4 text-left ${
                  form.fulfillment === 'delivery' ? 'border-rose bg-rose/5' : 'border-cocoa/15'
                }`}
              >
                <Truck className="h-5 w-5 text-rose" />
                <span>
                  <span className="block text-sm font-semibold text-cocoa">Local delivery</span>
                  <span className="block text-xs text-muted">
                    {commerce?.deliveryFeeCents ? money(commerce.deliveryFeeCents, symbol) : 'Free'} · free over{' '}
                    {money(commerce?.freeDeliveryThresholdCents || 0, symbol)}
                  </span>
                </span>
              </button>
              <button
                type="button"
                disabled={!commerce?.pickupEnabled}
                onClick={() => setForm((f) => ({ ...f, fulfillment: 'pickup' }))}
                className={`flex items-center gap-3 rounded-3xl border p-4 text-left disabled:opacity-50 ${
                  form.fulfillment === 'pickup' ? 'border-rose bg-rose/5' : 'border-cocoa/15'
                }`}
              >
                <Store className="h-5 w-5 text-rose" />
                <span>
                  <span className="block text-sm font-semibold text-cocoa">Pickup in store</span>
                  <span className="block text-xs text-muted">{commerce?.deliveryZones?.length ? 'Old Town counter' : 'In store'}</span>
                </span>
              </button>
            </div>

            {form.fulfillment === 'delivery' && (
              <div className="mt-5 grid gap-4">
                <div>
                  <label htmlFor="co-address" className="label">Address</label>
                  <input id="co-address" value={form.address} onChange={set('address')} className="field" />
                  {errors.address && <p className="mt-1 text-xs text-rose">{errors.address}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="co-city" className="label">City / zone</label>
                    <input id="co-city" value={form.city} onChange={set('city')} className="field" />
                    {errors.city && <p className="mt-1 text-xs text-rose">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="co-postal" className="label">Postal code</label>
                    <input id="co-postal" value={form.postalCode} onChange={set('postalCode')} className="field" />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5">
              <label htmlFor="co-notes" className="label">
                {form.fulfillment === 'delivery' ? 'Delivery instructions' : 'Pickup notes'}
              </label>
              <textarea id="co-notes" rows={2} value={form.instructions} onChange={set('instructions')} className="field" />
            </div>
          </section>

          {/* 3 — Schedule */}
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">3. Date & time</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-date" className="label">
                  {form.fulfillment === 'delivery' ? 'Delivery date' : 'Pickup date'}
                </label>
                <input
                  id="co-date"
                  type="date"
                  min={minDate}
                  value={form.deliveryDate}
                  onChange={set('deliveryDate')}
                  className="field"
                />
                {errors.deliveryDate && <p className="mt-1 text-xs text-rose">{errors.deliveryDate}</p>}
              </div>
              <div>
                <label htmlFor="co-slot" className="label">Time slot</label>
                <select id="co-slot" value={form.timeSlot} onChange={set('timeSlot')} className="field">
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              Cakes need {commerce?.leadTimeDays || 1} day{commerce?.leadTimeDays === 1 ? '' : 's'} notice.
              We bake in small batches, so slots are limited.
            </p>
          </section>

          {/* 4 — Payment */}
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">4. Payment</h2>
            <div className="mt-5 flex items-start gap-3 rounded-3xl bg-butter/60 p-4">
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
              <div className="text-sm text-cocoa/80">
                <p className="font-semibold text-cocoa">Test checkout — no card is charged</p>
                <p className="mt-1">
                  A payment provider is not connected yet, so this order is recorded as <strong>unpaid</strong> and
                  no card details are collected or stored. Connect a provider in admin settings to take real payments.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted">
              <Lock className="h-3.5 w-3.5" />
              We never collect or store raw card details.
            </div>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold">Order summary</h2>
            <ul className="mt-5 space-y-3">
              {items.map((i) => (
                <li key={`${i.productId}-${i.variantLabel}-${i.flavor}`} className="flex gap-3">
                  <img src={i.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-cocoa">{i.name}</p>
                    <p className="text-xs text-muted">
                      {i.quantity} × {money(i.unitPriceCents, symbol)}
                      {i.variantLabel ? ` · ${i.variantLabel}` : ''}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{money(i.unitPriceCents * i.quantity, symbol)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <label htmlFor="co-promo" className="label">Discount code</label>
              <input
                id="co-promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="SWEET10"
                className="field"
              />
            </div>

            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{money(subtotalCents, symbol)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="font-semibold">{fee === 0 ? 'Free' : money(fee, symbol)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Estimated tax</dt>
                <dd className="font-semibold">{money(tax, symbol)}</dd>
              </div>
              <div className="flex justify-between border-t border-cocoa/10 pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-xl font-semibold">{money(total, symbol)}</dd>
              </div>
            </dl>

            <button type="submit" disabled={submitting} className="btn-dark mt-6 w-full">
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <Check className="h-3.5 w-3.5" /> You will get a confirmation email once accepted.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
