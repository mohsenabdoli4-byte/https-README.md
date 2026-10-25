import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { money, faNum, formatDate } from '../../lib/format.js';
import { useSite } from '../../context/SiteContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminPromotions() {
  const { symbol } = useSite();
  const { success, error } = useToast();
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState({
    code: '',
    kind: 'percent',
    value: '',
    minSubtotal: '',
    expiresAt: '',
    usageLimit: '',
  });
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/admin/promotions').then((d) => setPromotions(d.promotions || []));
  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/promotions', {
        code: form.code,
        kind: form.kind,
        value: form.kind === 'percent' ? Number(form.value) : Math.round(Number(form.value) * 100),
        minSubtotalCents: Math.round(Number(form.minSubtotal || 0) * 100),
        expiresAt: form.expiresAt || null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      });
      success('کد تخفیف ساخته شد.');
      setForm({ code: '', kind: 'percent', value: '', minSubtotal: '', expiresAt: '', usageLimit: '' });
      load();
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (p) => {
    await api.patch(`/admin/promotions/${p.id}`, { active: !p.active });
    load();
  };

  const remove = async (p) => {
    await api.del(`/admin/promotions/${p.id}`);
    load();
  };

  return (
    <div>
      <h1 className="h-display text-3xl">تخفیف‌ها</h1>
      <p className="mt-1 text-sm text-muted">کدهای تخفیف هنگام تسویه حساب در سرور بررسی می‌شوند.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="card overflow-x-auto p-2">
          <table className="w-full text-start text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="p-3 text-start">کد</th>
                <th className="p-3 text-start">تخفیف</th>
                <th className="p-3 text-start">حداقل سفارش</th>
                <th className="p-3 text-start">انقضا</th>
                <th className="p-3 text-start">استفاده‌شده</th>
                <th className="p-3 text-start">فعال</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/10">
              {promotions.map((p) => (
                <tr key={p.id}>
                  <td className="p-3 font-semibold text-cocoa ltr text-start">{p.code}</td>
                  <td className="p-3">{p.kind === 'percent' ? `${faNum(p.value)}٪` : money(p.value, symbol)}</td>
                  <td className="p-3 text-muted">{money(p.min_subtotal_cents, symbol)}</td>
                  <td className="p-3 text-muted">{p.expires_at ? formatDate(p.expires_at) : '—'}</td>
                  <td className="p-3 text-muted">{faNum(p.used_count)}{p.usage_limit ? ` / ${faNum(p.usage_limit)}` : ''}</td>
                  <td className="p-3">
                    <button onClick={() => toggle(p)} className={`chip ${p.active ? 'bg-mint' : 'bg-muted/20 text-muted'}`}>
                      {p.active ? 'فعال' : 'خاموش'}
                    </button>
                  </td>
                  <td className="p-3 text-end">
                    <button onClick={() => remove(p)} aria-label={`حذف ${p.code}`} className="text-muted hover:text-rose">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-muted">هنوز کد تخفیفی ثبت نشده است.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={create} className="card h-fit p-6">
          <h2 className="font-display text-xl font-semibold">کد تخفیف جدید</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="pr-code">کد</label>
              <input id="pr-code" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className="field ltr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="pr-kind">نوع</label>
                <select id="pr-kind" value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))} className="field">
                  <option value="percent">درصدی</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="pr-value">{form.kind === 'percent' ? 'درصد' : `مبلغ (${symbol})`}</label>
                <input id="pr-value" required type="number" step="0.01" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className="field ltr" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="pr-min">حداقل سفارش ({symbol})</label>
              <input id="pr-min" type="number" step="0.01" value={form.minSubtotal} onChange={(e) => setForm((f) => ({ ...f, minSubtotal: e.target.value }))} className="field ltr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="pr-exp">انقضا</label>
                <input id="pr-exp" type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="label" htmlFor="pr-limit">حد استفاده</label>
                <input id="pr-limit" type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} className="field ltr" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-dark mt-5 w-full">
            <Plus className="h-4 w-4" /> ساخت کد تخفیف
          </button>
        </form>
      </div>
    </div>
  );
}
