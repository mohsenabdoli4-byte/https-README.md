import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  BarChart3,
  CakeSlice,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const LINKS = [
  { to: '/admin', label: 'داشبورد', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'محصولات', icon: CakeSlice },
  { to: '/admin/orders', label: 'سفارش‌ها', icon: ShoppingBag },
  { to: '/admin/content', label: 'محتوای صفحه اصلی', icon: FileText },
  { to: '/admin/promotions', label: 'تخفیف‌ها', icon: Tag },
  { to: '/admin/testimonials', label: 'نظرات مشتریان', icon: Star },
  { to: '/admin/settings', label: 'تنظیمات فروشگاه', icon: Settings },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/signin', { replace: true, state: { from: '/admin' } });
  }, [loading, user, navigate]);

  if (loading) {
    return <div className="container-x py-24 text-center text-sm text-muted">در حال بررسی دسترسی…</div>;
  }

  if (!user) return null;

  if (user.role !== 'admin') {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="h-display text-3xl">دسترسی مدیر لازم است</h1>
        <p className="mt-3 text-sm text-muted">
          این بخش محدود است. حساب کاربری شما دسترسی مدیریت ندارد.
        </p>
        <Link to="/" className="btn-dark mt-6">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-x grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit lg:sticky lg:top-8">
          <div className="card p-4">
            <div className="flex items-center gap-2 px-2 py-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cocoa text-cream">
                <BarChart3 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-cocoa">مدیر</p>
                <p className="text-xs text-muted">Maison Fraise</p>
              </div>
            </div>
            <nav className="mt-3 grid gap-1">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive ? 'bg-blush text-cocoa' : 'text-cocoa/70 hover:bg-blush/50'
                    }`
                  }
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 border-t border-cocoa/10 pt-3">
              <Link to="/" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-cocoa/70 hover:bg-blush/50">
                <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> بازگشت به فروشگاه
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-cocoa/70 hover:bg-blush/50"
              >
                <LogOut className="h-4 w-4" /> خروج
              </button>
            </div>
          </div>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
