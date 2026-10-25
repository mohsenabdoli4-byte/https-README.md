import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { money, faNum, formatDate, STATUS_LABELS, STATUS_STYLES, PAYMENT_LABELS, ORDER_STATUSES } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSite } from '../context/SiteContext.jsx';

export default function OrderDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { symbol } = useSite();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/signin', { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/orders/${id}`)
      .then((d) => setOrder(d.order))
      .catch((e) => setError(e.message));
  }, [id, user]);

  if (error) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="h-display text-3xl">این سفارش باز نشد</h1>
        <p className="mt-3 text-sm text-muted">{error}</p>
        <Link to="/account" className="btn-dark mt-6">بازگشت به حساب کاربری</Link>
      </div>
    );
  }

  if (!order) {
    return <div className="container-x py-24 text-center text-sm text-muted">در حال بارگذاری سفارش…</div>;
  }

  const stepIndex = ORDER_STATUSES.indexOf(order.status);
  const timeline = ORDER_STATUSES.filter((s) => s !== 'cancelled');

  return (
    <div className="container-x py-10">
      <Link to="/account" className="inline-flex items-center gap-2 text-sm text-muted hover:text-rose">
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> بازگشت به حساب کاربری
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">سفارش</p>
          <h1 className="h-display mt-2 text-3xl sm:text-4xl ltr text-start">{order.order_number}</h1>
          <p className="mt-2 text-sm text-muted">ثبت‌شده در {formatDate(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <span className={`chip ${STATUS_STYLES[order.status] || 'bg-blush'}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
          <span className={`chip ${order.payment_status === 'paid' ? 'bg-mint' : 'bg-butter/70'} text-cocoa`}>
            پرداخت: {PAYMENT_LABELS[order.payment_status] || order.payment_status}
          </span>
        </div>
      </div>

      {order.status !== 'cancelled' ? (
        <ol className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {timeline.map((s, i) => (
            <li
              key={s}
              className={`rounded-3xl p-4 text-sm ${
                i <= stepIndex ? 'bg-mint text-cocoa' : 'bg-white text-muted ring-1 ring-cocoa/10'
              }`}
            >
              {i <= stepIndex && <CheckCircle2 className="mb-1 h-4 w-4" />}
              {STATUS_LABELS[s]}
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-8 rounded-3xl bg-muted/15 p-5 text-sm text-muted">
          این سفارش لغو شده است{order.cancel_reason ? `: ${order.cancel_reason}` : '.'}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold">اقلام</h2>
          <ul className="mt-4 divide-y divide-cocoa/10">
            {order.items.map((i) => (
              <li key={`${i.productId}-${i.variantLabel}`} className="flex items-center gap-4 py-3">
                <img src={i.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-cocoa">{i.name}</p>
                  <p className="text-xs text-muted">
                    {faNum(i.quantity)} × {money(i.unitPriceCents, symbol)}
                    {i.variantLabel ? ` · ${i.variantLabel}` : ''}
                    {i.flavor ? ` · ${i.flavor}` : ''}
                  </p>
                  {i.customization?.message && (
                    <p className="text-xs text-cocoa/70">پیام: «{i.customization.message}»</p>
                  )}
                </div>
                <p className="text-sm font-semibold">{money(i.lineTotalCents, symbol)}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold">خلاصه</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">جمع اقلام</dt><dd>{money(order.subtotal_cents, symbol)}</dd></div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between text-rose"><dt>تخفیف {order.promo_code && `(${order.promo_code})`}</dt><dd>−{money(order.discount_cents, symbol)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-muted">هزینه ارسال</dt><dd>{order.delivery_fee_cents === 0 ? 'رایگان' : money(order.delivery_fee_cents, symbol)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">مالیات</dt><dd>{money(order.tax_cents, symbol)}</dd></div>
              <div className="flex justify-between border-t border-cocoa/10 pt-3 font-semibold"><dt>مجموع</dt><dd>{money(order.total_cents, symbol)}</dd></div>
            </dl>
          </div>

          <div className="card p-6 text-sm">
            <h2 className="font-display text-xl font-semibold">نحوه تحویل</h2>
            <p className="mt-3 text-cocoa">
              {order.fulfillment === 'pickup' ? 'تحویل حضوری در فروشگاه' : 'ارسال محلی'}
            </p>
            {order.address && (
              <p className="text-muted">
                {order.address}
                {order.city ? `، ${order.city}` : ''} {order.postal_code || ''}
              </p>
            )}
            {order.delivery_date && (
              <p className="text-muted">
                <span className="ltr inline-block">{order.time_slot}</span> · {new Date(order.delivery_date).toLocaleDateString('fa-IR')}
              </p>
            )}
            {order.instructions && <p className="mt-2 text-muted">توضیحات: {order.instructions}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
