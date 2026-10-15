import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useSite } from '../../context/SiteContext.jsx';

export default function AdminSettings() {
  const { reload } = useSite();
  const { success, error } = useToast();
  const [settings, setSettings] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then((d) => setSettings(d.settings));
  }, []);

  const setIn = (group, key, value) =>
    setSettings((s) => ({ ...s, [group]: { ...s[group], [key]: value } }));

  const setColor = (key, value) =>
    setSettings((s) => ({
      ...s,
      brand: { ...s.brand, colors: { ...s.brand.colors, [key]: value } },
    }));

  const saveGroup = async (group) => {
    setBusy(true);
    try {
      await api.put(`/admin/settings/${group}`, settings[group]);
      await reload();
      success('Settings saved.');
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!settings) return <div className="card h-64 animate-pulse bg-blush/40" />;

  const colors = settings.brand.colors || {};

  return (
    <div>
      <h1 className="h-display text-3xl">Business settings</h1>
      <p className="mt-1 text-sm text-muted">Brand, contact, commerce and announcement details.</p>

      <div className="mt-6 space-y-6">
        {/* Brand */}
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Brand</h2>
            <button onClick={() => saveGroup('brand')} disabled={busy} className="btn-dark !py-2">Save</button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="b-name">Brand name</label>
              <input id="b-name" value={settings.brand.name || ''} onChange={(e) => setIn('brand', 'name', e.target.value)} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="b-logo">Logo text</label>
              <input id="b-logo" value={settings.brand.logoText || ''} onChange={(e) => setIn('brand', 'logoText', e.target.value)} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="b-tag">Tagline</label>
              <input id="b-tag" value={settings.brand.tagline || ''} onChange={(e) => setIn('brand', 'tagline', e.target.value)} className="field" />
            </div>
          </div>

          <h3 className="label mt-6">Palette</h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="rounded-2xl bg-white p-3 text-center ring-1 ring-cocoa/10">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => setColor(key, e.target.value)}
                  aria-label={`${key} colour`}
                  className="mx-auto h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent"
                />
                <p className="mt-2 text-xs capitalize text-muted">{key}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Colours are stored with the brand. The storefront palette is applied from the design system.
          </p>
        </section>

        {/* Contact */}
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Contact</h2>
            <button onClick={() => saveGroup('contact')} disabled={busy} className="btn-dark !py-2">Save</button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-email">Email</label>
              <input id="c-email" value={settings.contact.email || ''} onChange={(e) => setIn('contact', 'email', e.target.value)} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="c-phone">Phone</label>
              <input id="c-phone" value={settings.contact.phone || ''} onChange={(e) => setIn('contact', 'phone', e.target.value)} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="c-address">Address</label>
              <input id="c-address" value={settings.contact.address || ''} onChange={(e) => setIn('contact', 'address', e.target.value)} className="field" />
            </div>
          </div>
        </section>

        {/* Commerce */}
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Commerce</h2>
            <button onClick={() => saveGroup('commerce')} disabled={busy} className="btn-dark !py-2">Save</button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label" htmlFor="cm-currency">Currency code</label>
              <input id="cm-currency" value={settings.commerce.currency || ''} onChange={(e) => setIn('commerce', 'currency', e.target.value)} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="cm-symbol">Currency symbol</label>
              <input id="cm-symbol" value={settings.commerce.currencySymbol || ''} onChange={(e) => setIn('commerce', 'currencySymbol', e.target.value)} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="cm-tax">Tax rate (e.g. 0.08)</label>
              <input id="cm-tax" type="number" step="0.01" value={settings.commerce.taxRate ?? 0} onChange={(e) => setIn('commerce', 'taxRate', Number(e.target.value))} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="cm-fee">Delivery fee ({settings.commerce.currencySymbol})</label>
              <input id="cm-fee" type="number" step="0.01" value={((settings.commerce.deliveryFeeCents || 0) / 100).toFixed(2)} onChange={(e) => setIn('commerce', 'deliveryFeeCents', Math.round(Number(e.target.value) * 100))} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="cm-free">Free delivery over ({settings.commerce.currencySymbol})</label>
              <input id="cm-free" type="number" step="0.01" value={((settings.commerce.freeDeliveryThresholdCents || 0) / 100).toFixed(2)} onChange={(e) => setIn('commerce', 'freeDeliveryThresholdCents', Math.round(Number(e.target.value) * 100))} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="cm-lead">Preparation lead time (days)</label>
              <input id="cm-lead" type="number" value={settings.commerce.leadTimeDays ?? 1} onChange={(e) => setIn('commerce', 'leadTimeDays', Number(e.target.value))} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="cm-cap">Max daily orders</label>
              <input id="cm-cap" type="number" value={settings.commerce.maxDailyOrders ?? 40} onChange={(e) => setIn('commerce', 'maxDailyOrders', Number(e.target.value))} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="cm-provider">Payment provider</label>
              <select id="cm-provider" value={settings.commerce.paymentProvider || 'test'} onChange={(e) => setIn('commerce', 'paymentProvider', e.target.value)} className="field">
                <option value="test">Test (no charge)</option>
                <option value="stripe">Stripe</option>
                <option value="wix_payments">Wix Payments</option>
              </select>
            </div>
            <label className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm ring-1 ring-cocoa/10">
              <input type="checkbox" checked={!!settings.commerce.pickupEnabled} onChange={(e) => setIn('commerce', 'pickupEnabled', e.target.checked)} className="h-4 w-4 accent-rose" />
              Pickup enabled
            </label>
            <label className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm ring-1 ring-cocoa/10">
              <input type="checkbox" checked={!!settings.commerce.paymentConfigured} onChange={(e) => setIn('commerce', 'paymentConfigured', e.target.checked)} className="h-4 w-4 accent-rose" />
              Payment provider connected
            </label>
          </div>
          <p className="mt-3 text-xs text-muted">
            Payment secrets are never stored here. Connect a provider to switch the storefront out of test mode.
          </p>
        </section>

        {/* Announcement */}
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Announcement bar</h2>
            <button onClick={() => saveGroup('announcement')} disabled={busy} className="btn-dark !py-2">Save</button>
          </div>
          <div className="mt-4 space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!settings.announcement.enabled} onChange={(e) => setIn('announcement', 'enabled', e.target.checked)} className="h-4 w-4 accent-rose" />
              Show the announcement bar
            </label>
            <div>
              <label className="label" htmlFor="an-text">Message</label>
              <input id="an-text" value={settings.announcement.text || ''} onChange={(e) => setIn('announcement', 'text', e.target.value)} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="an-href">Link</label>
              <input id="an-href" value={settings.announcement.href || ''} onChange={(e) => setIn('announcement', 'href', e.target.value)} className="field" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
