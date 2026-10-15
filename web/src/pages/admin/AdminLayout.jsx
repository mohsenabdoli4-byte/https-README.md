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
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: CakeSlice },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/content', label: 'Content', icon: FileText },
  { to: '/admin/promotions', label: 'Promotions', icon: Tag },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { to: '/admin/settings', label: 'Business settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/signin', { replace: true, state: { from: '/admin' } });
  }, [loading, user, navigate]);

  if (loading) {
    return <div className="container-x py-24 text-center text-sm text-muted">Checking access…</div>;
  }

  if (!user) return null;

  if (user.role !== 'admin') {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="h-display text-3xl">Administrator access required</h1>
        <p className="mt-3 text-sm text-muted">
          This area is restricted. Your account does not have admin permissions.
        </p>
        <Link to="/" className="btn-dark mt-6">Back to the store</Link>
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
                <p className="text-sm font-semibold text-cocoa">Admin</p>
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
                <ArrowLeft className="h-4 w-4" /> Back to store
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-cocoa/70 hover:bg-blush/50"
              >
                <LogOut className="h-4 w-4" /> Sign out
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
