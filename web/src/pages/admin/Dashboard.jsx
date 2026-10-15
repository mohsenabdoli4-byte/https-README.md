import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { money, formatDate, STATUS_LABELS, STATUS_STYLES } from '../../lib/format.js';
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
    { label: 'Total orders', value: stats.totalOrders },
    { label: 'Paid revenue', value: money(stats.revenueCents, symbol) },
    { label: 'Average order', value: money(stats.averageOrderCents, symbol) },
    { label: 'Newsletter subscribers', value: stats.subscribers },
    { label: 'Live products', value: stats.productCount },
  ];

  return (
    <div>
      <h1 className="h-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">A live snapshot of the store.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-cocoa">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold">Order status breakdown</h2>
          {stats.statusBreakdown.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {stats.statusBreakdown.map((s) => (
                <li key={s.status} className="flex items-center justify-between">
                  <span className={`chip ${STATUS_STYLES[s.status] || 'bg-blush'}`}>
                    {STATUS_LABELS[s.status] || s.status}
                  </span>
                  <span className="font-semibold">{s.n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold">Bestselling products</h2>
          {stats.bestsellers.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Sales data appears once orders are placed.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.bestsellers.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <img src={b.image_url} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  <span className="flex-1 text-sm text-cocoa">{b.name}</span>
                  <span className="text-sm font-semibold">{b.sold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-rose hover:underline">View all</Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-2">Order</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cocoa/10">
                {stats.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-medium">{o.order_number}</td>
                    <td className="py-3 text-muted">{o.email}</td>
                    <td className="py-3 text-muted">{formatDate(o.created_at)}</td>
                    <td className="py-3">
                      <span className={`chip ${STATUS_STYLES[o.status] || 'bg-blush'}`}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold">{money(o.total_cents, symbol)}</td>
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
