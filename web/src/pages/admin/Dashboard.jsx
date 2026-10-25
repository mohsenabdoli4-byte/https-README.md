import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { money, faNum, formatDate, STATUS_LABELS, STATUS_STYLES } from '../../lib/format.js';
import { useSite } from '../../context/SiteContext.jsx';

export default function Dashboard() {
  const { symbol } = useSite();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="card p-8 text-sm text-rose">{error}</div>;
  if (!stats) return <div className="card h-64 animate-pulse bg-blush/40" />;

  const cards = [
    { label: 'کل سفارش‌ها', value: faNum(stats.totalOrders) },
    { label: 'درآمد پرداخت‌شده', value: money(stats.revenueCents, symbol) },
    { label: 'میانگین سفارش', value: money(stats.averageOrderCents, symbol) },
    { label: 'مشترکان خبرنامه', value: faNum(stats.subscribers) },
    { label: 'محصولات فعال', value: faNum(stats.productCount) },
  ];

  return (
    <div>
      <h1 className="h-display text-3xl">داشبورد</h1>
      <p className="mt-1 text-sm text-muted">تصویری زنده از فروشگاه.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-6">
            <p className="text-xs font-semibold text-muted">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-cocoa">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold">تفکیک وضعیت سفارش‌ها</h2>
          {stats.statusBreakdown.length === 0 ? (
            <p className="mt-3 text-sm text-muted">هنوز سفارشی ثبت نشده است.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {stats.statusBreakdown.map((s) => (
                <li key={s.status} className="flex items-center justify-between">
                  <span className={`chip ${STATUS_STYLES[s.status] || 'bg-blush'}`}>
                    {STATUS_LABELS[s.status] || s.status}
                  </span>
                  <span className="font-semibold">{faNum(s.n)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold">محصولات پرفروش</h2>
          {stats.bestsellers.length === 0 ? (
            <p className="mt-3 text-sm text-muted">داده فروش پس از ثبت سفارش‌ها نمایش داده می‌شود.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.bestsellers.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <img src={b.image_url} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  <span className="flex-1 text-sm text-cocoa">{b.name}</span>
                  <span className="text-sm font-semibold">{faNum(b.sold)} فروش</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">سفارش‌های اخیر</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-rose hover:underline">مشاهده همه</Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-muted">هنوز سفارشی ثبت نشده است.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="py-2 text-start">سفارش</th>
                  <th className="py-2 text-start">مشتری</th>
                  <th className="py-2 text-start">تاریخ</th>
                  <th className="py-2 text-start">وضعیت</th>
                  <th className="py-2 text-end">مجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cocoa/10">
                {stats.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-medium ltr text-start">{o.order_number}</td>
                    <td className="py-3 text-muted ltr text-start">{o.email}</td>
                    <td className="py-3 text-muted">{formatDate(o.created_at)}</td>
                    <td className="py-3">
                      <span className={`chip ${STATUS_STYLES[o.status] || 'bg-blush'}`}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td className="py-3 text-end font-semibold">{money(o.total_cents, symbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
