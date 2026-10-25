import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, PackageCheck } from 'lucide-react';
import { money, faNum, STATUS_LABELS } from '../lib/format.js';
import { useSite } from '../context/SiteContext.jsx';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const { symbol } = useSite();
  const order = state?.order;

  if (!order) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="h-display text-3xl">سفارشی برای نمایش وجود ندارد</h1>
        <p className="mt-3 text-sm text-muted">
          اگر همین حالا سفارشی ثبت کرده‌اید، جزئیات آن را در حساب کاربری خود ببینید.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/shop" className="btn-dark">مشاهده منو</Link>
          <Link to="/account" className="btn-ghost">حساب کاربری من</Link>
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
        <h1 className="h-display mt-5 text-3xl sm:text-4xl">سپاسگزاریم — سفارش شما ثبت شد</h1>
        <p className="mt-3 text-sm text-muted">
          سفارش <span className="font-semibold text-cocoa ltr inline-block">{order.order_number}</span> · وضعیت{' '}
          <span className="font-semibold text-cocoa">{STATUS_LABELS[order.status] || order.status}</span>
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-3xl bg-butter/60 p-4 text-sm text-cocoa/80">
          <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
          <p>
            این سفارش به‌صورت <strong>پرداخت‌نشده</strong> ثبت شده است، زیرا هنوز درگاه پرداختی متصل نشده.
            جزئیات سفارش و پرداخت را از طریق ایمیل تأیید می‌کنیم.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="label">نحوه تحویل</h2>
            <p className="text-sm text-cocoa">
              {order.fulfillment === 'pickup' ? 'تحویل حضوری در فروشگاه' : 'ارسال محلی'}
            </p>
            {order.address && (
              <p className="text-sm text-muted">
                {order.address}
                {order.city ? `، ${order.city}` : ''} {order.postal_code || ''}
              </p>
            )}
            {order.delivery_date && (
              <p className="text-sm text-muted">
                <span className="ltr inline-block">{order.time_slot}</span> · {new Date(order.delivery_date).toLocaleDateString('fa-IR')}
              </p>
            )}
          </div>
          <div>
            <h2 className="label">اطلاعات تماس</h2>
            <p className="text-sm text-cocoa">{order.customer_name}</p>
            <p className="text-sm text-muted ltr text-start">{order.email}</p>
            {order.phone && <p className="text-sm text-muted ltr text-start">{order.phone}</p>}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="label">اقلام</h2>
          <ul className="divide-y divide-cocoa/10">
            {order.items.map((i) => (
              <li key={`${i.productId}-${i.variantLabel}`} className="flex items-center gap-4 py-3">
                <img src={i.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-cocoa">{i.name}</p>
                  <p className="text-xs text-muted">
                    {faNum(i.quantity)} × {money(i.unitPriceCents, symbol)}
                    {i.variantLabel ? ` · ${i.variantLabel}` : ''}
                  </p>
                </div>
                <p className="text-sm font-semibold">{money(i.lineTotalCents, symbol)}</p>
              </li>
            ))}
          </ul>
        </div>

        <dl className="mt-6 space-y-2 border-t border-cocoa/10 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">جمع اقلام</dt><dd>{money(order.subtotal_cents, symbol)}</dd></div>
          {order.discount_cents > 0 && (
            <div className="flex justify-between text-rose"><dt>تخفیف</dt><dd>−{money(order.discount_cents, symbol)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-muted">هزینه ارسال</dt><dd>{order.delivery_fee_cents === 0 ? 'رایگان' : money(order.delivery_fee_cents, symbol)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">مالیات</dt><dd>{money(order.tax_cents, symbol)}</dd></div>
          <div className="flex justify-between border-t border-cocoa/10 pt-3 text-base font-semibold"><dt>مجموع</dt><dd>{money(order.total_cents, symbol)}</dd></div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={`/order/${order.id}`} className="btn-dark">پیگیری این سفارش</Link>
          <Link to="/shop" className="btn-ghost">ادامه خرید</Link>
        </div>
      </div>
    </div>
  );
}
