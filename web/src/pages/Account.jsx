import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, MapPin, Package, Plus, Trash2, User } from 'lucide-react';
import { api } from '../lib/api.js';
import { money, faNum, formatDate, STATUS_LABELS, STATUS_STYLES, PAYMENT_LABELS } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Account() {
  const { user, loading: authLoading, logout, setUser } = useAuth();
  const { symbol } = useSite();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [tab, setTab] = useState('orders');
  const [profile, setProfile] = useState({ fullName: '', phone: '' });
  const [address, setAddress] = useState({ label: 'خانه', line1: '', city: '', postalCode: '' });

  useEffect(() => {
    if (!authLoading && !user) navigate('/signin', { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setProfile({ fullName: user.fullName || '', phone: user.phone || '' });
    api.get('/orders').then((d) => setOrders(d.orders || [])).catch(() => {});
    api.get('/auth/addresses').then((d) => setAddresses(d.addresses || [])).catch(() => {});
  }, [user]);

  if (authLoading || !user) {
    return <div className="container-x py-24 text-center text-sm text-muted">در حال بارگذاری حساب شما…</div>;
  }

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch('/auth/profile', profile);
      setUser(res.user);
      success('پروفایل به‌روزرسانی شد.');
    } catch (err) {
      error(err.message);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/addresses', address);
      setAddresses((a) => [res.address, ...a]);
      setAddress({ label: 'خانه', line1: '', city: '', postalCode: '' });
      success('نشانی ذخیره شد.');
    } catch (err) {
      error(err.message);
    }
  };

  const removeAddress = async (id) => {
    await api.del(`/auth/addresses/${id}`);
    setAddresses((a) => a.filter((x) => x.id !== id));
  };

  const TABS = [
    { key: 'orders', label: 'سفارش‌ها', icon: Package },
    { key: 'profile', label: 'پروفایل', icon: User },
    { key: 'addresses', label: 'نشانی‌ها', icon: MapPin },
  ];

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">حساب کاربری شما</p>
          <h1 className="h-display mt-2 text-4xl sm:text-5xl">
            سلام، {user.fullName?.split(' ')[0] || 'دوست عزیز'}
          </h1>
          <p className="mt-2 text-sm text-muted ltr text-start">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {user.role === 'admin' && (
            <Link to="/admin" className="btn-ghost">داشبورد مدیریت</Link>
          )}
          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="btn-ghost"
          >
            <LogOut className="h-4 w-4" /> خروج
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`chip gap-2 !px-4 !py-2.5 ${
              tab === t.key ? 'bg-cocoa text-cream' : 'bg-white ring-1 ring-cocoa/10'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="card p-10 text-center">
                <h2 className="font-display text-xl font-semibold">هنوز سفارشی ثبت نشده است</h2>
                <p className="mt-2 text-sm text-muted">سفارش‌های گذشته شما اینجا نمایش داده می‌شوند.</p>
                <Link to="/shop" className="btn-dark mt-6">شروع خرید</Link>
              </div>
            ) : (
              orders.map((o) => (
                <Link key={o.id} to={`/order/${o.id}`} className="card flex flex-wrap items-center gap-4 p-5 hover:shadow-soft">
                  <div className="flex-1">
                    <p className="font-display text-lg font-semibold ltr text-start">{o.order_number}</p>
                    <p className="text-xs text-muted">{formatDate(o.created_at)} · {faNum(o.items.length)} قلم</p>
                  </div>
                  <span className={`chip ${STATUS_STYLES[o.status] || 'bg-blush'}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                  <span className={`chip ${o.payment_status === 'paid' ? 'bg-mint' : 'bg-butter/70'} text-cocoa`}>
                    {PAYMENT_LABELS[o.payment_status] || o.payment_status}
                  </span>
                  <p className="font-semibold">{money(o.total_cents, symbol)}</p>
                </Link>
              ))
            )}
          </div>
        )}

        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="card max-w-lg p-6">
            <h2 className="font-display text-xl font-semibold">پروفایل</h2>
            <div className="mt-5">
              <label htmlFor="ac-name" className="label">نام و نام خانوادگی</label>
              <input id="ac-name" value={profile.fullName} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} className="field" />
            </div>
            <div className="mt-4">
              <label htmlFor="ac-phone" className="label">تلفن</label>
              <input id="ac-phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="field ltr" />
            </div>
            <div className="mt-4">
              <label className="label">ایمیل</label>
              <input value={user.email} disabled className="field ltr bg-cream" />
            </div>
            <button type="submit" className="btn-dark mt-6">ذخیره تغییرات</button>
          </form>
        )}

        {tab === 'addresses' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              {addresses.length === 0 && (
                <div className="card p-6 text-sm text-muted">هنوز نشانی ذخیره‌شده‌ای ندارید.</div>
              )}
              {addresses.map((a) => (
                <div key={a.id} className="card flex items-start justify-between gap-4 p-5">
                  <div>
                    <p className="font-semibold text-cocoa">{a.label}</p>
                    <p className="text-sm text-muted">{a.line1}</p>
                    <p className="text-sm text-muted">{[a.city, a.postal_code].filter(Boolean).join('، ')}</p>
                  </div>
                  <button onClick={() => removeAddress(a.id)} aria-label="حذف نشانی" className="text-muted hover:text-rose">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addAddress} className="card h-fit p-6">
              <h2 className="font-display text-xl font-semibold">افزودن نشانی</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="ad-label" className="label">برچسب</label>
                  <input id="ad-label" value={address.label} onChange={(e) => setAddress((a) => ({ ...a, label: e.target.value }))} className="field" />
                </div>
                <div>
                  <label htmlFor="ad-line1" className="label">نشانی</label>
                  <input id="ad-line1" required value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} className="field" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ad-city" className="label">شهر</label>
                    <input id="ad-city" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} className="field" />
                  </div>
                  <div>
                    <label htmlFor="ad-postal" className="label">کد پستی</label>
                    <input id="ad-postal" value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} className="field ltr" />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-dark mt-6">
                <Plus className="h-4 w-4" /> ذخیره نشانی
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
