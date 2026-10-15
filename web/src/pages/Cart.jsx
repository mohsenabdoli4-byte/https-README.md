import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../lib/api.js';
import { money } from '../lib/format.js';

export default function Cart() {
  const { items, remove, setQuantity, subtotalCents, clear } = useCart();
  const { symbol, commerce } = useSite();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const [checking, setChecking] = useState(false);

  const discount = applied?.discountCents || 0;
  const fee =
    items.length === 0 ||
    subtotalCents >= (commerce?.freeDeliveryThresholdCents || 0)
      ? 0
      : commerce?.deliveryFeeCents || 0;
  const tax = Math.round(Math.max(0, subtotalCents - discount) * (commerce?.taxRate || 0));
  const total = Math.max(0, subtotalCents - discount) + fee + tax;

  const applyCode = async (e) => {
    e.preventDefault();
    setChecking(true);
    try {
      const res = await api.post('/promotions/validate', { code, subtotalCents });
      setApplied(res);
      success(`Code ${res.code} applied.`);
    } catch (err) {
      setApplied(null);
      error(err.message);
    } finally {
      setChecking(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-x py-20">
        <div className="card mx-auto max-w-lg p-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blush">
            <ShoppingBag className="h-7 w-7 text-cocoa" />
          </span>
          <h1 className="h-display mt-6 text-3xl">Your bag is empty</h1>
          <p className="mt-3 text-sm text-muted">
            Add a few desserts and they will appear here, ready for checkout.
          </p>
          <Link to="/shop" className="btn-dark mt-7">
            Browse the menu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="h-display text-4xl sm:text-5xl">Your bag</h1>
      <p className="mt-2 text-sm text-muted">
        {items.length} {items.length === 1 ? 'line' : 'lines'} · prices are confirmed again at checkout.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantLabel}-${item.flavor}`}
              className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-full rounded-3xl object-cover sm:h-24 sm:w-24"
              />
              <div className="flex-1">
                <Link
                  to={`/product/${item.slug}`}
                  className="font-display text-lg font-semibold text-cocoa hover:text-rose"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {[item.variantLabel, item.flavor].filter(Boolean).join(' · ')}
                </p>
                {item.customization?.message && (
                  <p className="mt-1 text-xs text-cocoa/70">
                    Message: “{item.customization.message}”
                  </p>
                )}
                <p className="mt-2 text-sm font-semibold text-cocoa">
                  {money(item.unitPriceCents, symbol)} each
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-cocoa/15 bg-white">
                  <button
                    onClick={() => setQuantity(item, item.quantity - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-blush/60"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => setQuantity(item, item.quantity + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-blush/60"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="w-20 text-right font-semibold text-cocoa">
                  {money(item.unitPriceCents * item.quantity, symbol)}
                </p>
                <button
                  onClick={() => remove(item)}
                  aria-label={`Remove ${item.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-blush/60 hover:text-rose"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <Link to="/shop" className="btn-ghost">
              Continue shopping
            </Link>
            <button onClick={clear} className="text-sm text-muted hover:text-rose">
              Clear bag
            </button>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold">Order summary</h2>

            <form onSubmit={applyCode} className="mt-5">
              <label htmlFor="promo" className="label">
                Discount code
              </label>
              <div className="flex gap-2">
                <input
                  id="promo"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="SWEET10"
                  className="field"
                />
                <button type="submit" disabled={checking} className="btn-ghost shrink-0">
                  <Tag className="h-4 w-4" />
                  Apply
                </button>
              </div>
              {applied && (
                <p className="mt-2 text-xs font-semibold text-rose">
                  {applied.code} applied — you save {money(applied.discountCents, symbol)}.
                </p>
              )}
            </form>

            <dl className="mt-6 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{money(subtotalCents, symbol)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose">
                  <dt>Discount</dt>
                  <dd className="font-semibold">−{money(discount, symbol)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="font-semibold">
                  {fee === 0 ? 'Free' : money(fee, symbol)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Estimated tax</dt>
                <dd className="font-semibold">{money(tax, symbol)}</dd>
              </div>
              <div className="flex justify-between border-t border-cocoa/10 pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-xl font-semibold">{money(total, symbol)}</dd>
              </div>
            </dl>

            <button
              onClick={() => navigate('/checkout', { state: { promoCode: applied?.code || null } })}
              className="btn-dark mt-6 w-full"
            >
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              Totals are recalculated and verified on our server at checkout.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
