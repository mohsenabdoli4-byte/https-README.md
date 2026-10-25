import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Lock, Store, Truck } from 'lucide-react';
import { api } from '../lib/api.js';
import { money, faNum } from '../lib/format.js';
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'یک ایمیل معتبر وارد کنید.';
    if (!form.customerName.trim()) e.customerName = 'نام سفارش‌دهنده را وارد کنید.';
    if (form.fulfillment === 'delivery') {
      if (!form.address.trim()) e.address = 'نشانی تحویل را وارد کنید.';
      if (!form.city.trim()) e.city = 'شهر را وارد کنید.';
      if (!form.deliveryDate) e.deliveryDate = 'تاریخ ارسال را انتخاب کنید.';
    } else if (!form.deliveryDate) {
      e.deliveryDate = 'تاریخ تحویل حضوری را انتخاب کنید.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      error('سبد خرید شما خالی است.');
      return;
    }
    if (!validate()) {
      error('لطفاً فیلدهای مشخص‌شده را اصلاح کنید.');
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
      success('سفارش ثبت شد. تأییدیه به‌زودی ارسال می‌شود.');
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
        <h1 className="h-display text-3xl">چیزی برای تسویه وجود ندارد</h1>
        <p className="mt-3 text-sm text-muted">سبد خرید شما خالی است.</p>
        <Link to="/shop" className="btn-dark mt-6">
          مشاهده منو
        </Link>
      </div>
    );
  }

  const minDate = new Date(Date.now() + (commerce?.leadTimeDays || 1) * 86400000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="container-x py-10">
      <h1 className="h-display text-4xl sm:text-5xl">تسویه حساب</h1>
      <p className="mt-2 text-sm text-muted">
        قیمت‌ها، تخفیف‌ها و موجودی هنگام ثبت سفارش در سرور ما بررسی می‌شوند.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* 1 — Contact */}
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">۱. اطلاعات تماس</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-email" className="label">ایمیل</label>
                <input id="co-email" type="email" value={form.email} onChange={set('email')} className="field ltr" />
                {errors.email && <p className="mt-1 text-xs text-rose">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="co-name" className="label">نام و نام خانوادگی</label>
                <input id="co-name" value={form.customerName} onChange={set('customerName')} className="field" />
                {errors.customerName && <p className="mt-1 text-xs text-rose">{errors.customerName}</p>}
              </div>
              <div>
                <label htmlFor="co-phone" className="label">تلفن</label>
                <input id="co-phone" value={form.phone} onChange={set('phone')} className="field ltr" />
              </div>
            </div>
          </section>

          {/* 2 — Fulfillment */}
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">۲. ارسال یا تحویل حضوری</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, fulfillment: 'delivery' }))}
                className={`flex items-center gap-3 rounded-3xl border p-4 text-start ${
                  form.fulfillment === 'delivery' ? 'border-rose bg-rose/5' : 'border-cocoa/15'
                }`}
              >
                <Truck className="h-5 w-5 text-rose" />
                <span>
                  <span className="block text-sm font-semibold text-cocoa">ارسال محلی</span>
                  <span className="block text-xs text-muted">
                    {commerce?.deliveryFeeCents ? money(commerce.deliveryFeeCents, symbol) : 'رایگان'} · رایگان برای سفارش بالای{' '}
                    {money(commerce?.freeDeliveryThresholdCents || 0, symbol)}
                  </span>
                </span>
              </button>
              <button
                type="button"
                disabled={!commerce?.pickupEnabled}
                onClick={() => setForm((f) => ({ ...f, fulfillment: 'pickup' }))}
                className={`flex items-center gap-3 rounded-3xl border p-4 text-start disabled:opacity-50 ${
                  form.fulfillment === 'pickup' ? 'border-rose bg-rose/5' : 'border-cocoa/15'
                }`}
              >
                <Store className="h-5 w-5 text-rose" />
                <span>
                  <span className="block text-sm font-semibold text-cocoa">تحویل حضوری در فروشگاه</span>
                  <span className="block text-xs text-muted">{commerce?.deliveryZones?.length ? 'باجه فروشگاه' : 'در فروشگاه'}</span>
                </span>
              </button>
            </div>

            {form.fulfillment === 'delivery' && (
              <div className="mt-5 grid gap-4">
                <div>
                  <label htmlFor="co-address" className="label">نشانی</label>
                  <input id="co-address" value={form.address} onChange={set('address')} className="field" />
                  {errors.address && <p className="mt-1 text-xs text-rose">{errors.address}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="co-city" className="label">شهر / منطقه</label>
                    <input id="co-city" value={form.city} onChange={set('city')} className="field" />
                    {errors.city && <p className="mt-1 text-xs text-rose">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="co-postal" className="label">کد پستی</label>
                    <input id="co-postal" value={form.postalCode} onChange={set('postalCode')} className="field ltr" />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5">
              <label htmlFor="co-notes" className="label">
                {form.fulfillment === 'delivery' ? 'توضیحات ارسال' : 'توضیحات تحویل حضوری'}
              </label>
              <textarea id="co-notes" rows={2} value={form.instructions} onChange={set('instructions')} className="field" />
            </div>
          </section>

          {/* 3 — Schedule */}
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">۳. تاریخ و زمان</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-date" className="label">
                  {form.fulfillment === 'delivery' ? 'تاریخ ارسال' : 'تاریخ تحویل حضوری'}
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
                <label htmlFor="co-slot" className="label">بازه زمانی</label>
                <select id="co-slot" value={form.timeSlot} onChange={set('timeSlot')} className="field ltr">
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              کیک‌ها به {faNum(commerce?.leadTimeDays || 1)} روز زمان نیاز دارند.
              ما در دسته‌های کوچک می‌پزیم، بنابراین بازه‌های زمانی محدودند.
            </p>
          </section>

          {/* 4 — Payment */}
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">۴. پرداخت</h2>
            <div className="mt-5 flex items-start gap-3 rounded-3xl bg-butter/60 p-4">
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
              <div className="text-sm text-cocoa/80">
                <p className="font-semibold text-cocoa">تسویه آزمایشی — مبلغی از کارت کسر نمی‌شود</p>
                <p className="mt-1">
                  هنوز درگاه پرداختی متصل نشده است، بنابراین این سفارش به‌صورت <strong>پرداخت‌نشده</strong> ثبت می‌شود و
                  هیچ اطلاعات کارتی دریافت یا ذخیره نمی‌گردد. برای دریافت پرداخت واقعی، درگاه را در تنظیمات مدیریت متصل کنید.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted">
              <Lock className="h-3.5 w-3.5" />
              ما هرگز اطلاعات خام کارت را دریافت یا ذخیره نمی‌کنیم.
            </div>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold">خلاصه سفارش</h2>
            <ul className="mt-5 space-y-3">
              {items.map((i) => (
                <li key={`${i.productId}-${i.variantLabel}-${i.flavor}`} className="flex gap-3">
                  <img src={i.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-cocoa">{i.name}</p>
                    <p className="text-xs text-muted">
                      {faNum(i.quantity)} × {money(i.unitPriceCents, symbol)}
                      {i.variantLabel ? ` · ${i.variantLabel}` : ''}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{money(i.unitPriceCents * i.quantity, symbol)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <label htmlFor="co-promo" className="label">کد تخفیف</label>
              <input
                id="co-promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="SWEET10"
                className="field ltr"
              />
            </div>

            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">جمع اقلام</dt>
                <dd className="font-semibold">{money(subtotalCents, symbol)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">هزینه ارسال</dt>
                <dd className="font-semibold">{fee === 0 ? 'رایگان' : money(fee, symbol)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">مالیات برآوردی</dt>
                <dd className="font-semibold">{money(tax, symbol)}</dd>
              </div>
              <div className="flex justify-between border-t border-cocoa/10 pt-3">
                <dt className="font-semibold">مجموع</dt>
                <dd className="font-display text-xl font-semibold">{money(total, symbol)}</dd>
              </div>
            </dl>

            <button type="submit" disabled={submitting} className="btn-dark mt-6 w-full">
              {submitting ? 'در حال ثبت سفارش…' : 'ثبت سفارش'}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <Check className="h-3.5 w-3.5" /> پس از تأیید، ایمیل تأییدیه دریافت می‌کنید.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
