import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X, Heart } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { faNum } from '../lib/format.js';

const NAV = [
  { label: 'فروشگاه', to: '/shop' },
  { label: 'کیک‌ها', to: '/category/cakes' },
  { label: 'ماکارون‌ها', to: '/category/macarons' },
  { label: 'شیرینی‌ها', to: '/category/pastries' },
  { label: 'کاپ‌کیک‌ها', to: '/category/cupcakes' },
  { label: 'جعبه‌های هدیه', to: '/category/gift-boxes' },
  { label: 'داستان ما', to: '/our-story' },
  { label: 'تماس با ما', to: '/contact' },
];

export default function Header() {
  const { brand, announcement } = useSite();
  const { count } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(term)}`);
    setTerm('');
    setSearchOpen(false);
  };

  const brandName = brand?.logoText || brand?.name || 'Maison Fraise';

  return (
    <>
      {announcement?.enabled && announcement?.text && (
        <div className="bg-cocoa text-cream">
          <div className="container-x flex items-center justify-center py-2 text-center text-xs font-medium sm:text-sm">
            <Link to={announcement.href || '/shop'} className="hover:underline">
              {announcement.text}
            </Link>
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-50 transition-shadow ${
          scrolled ? 'shadow-[0_8px_30px_-24px_rgba(56,39,43,0.6)]' : ''
        }`}
      >
        <div className="bg-cream/90 backdrop-blur">
          <div className="container-x">
            <div className="my-3 flex items-center justify-between gap-3 rounded-full border border-cocoa/10 bg-white/80 px-4 py-2.5 shadow-card sm:px-5">
              <Link to="/" className="flex items-center gap-2.5 shrink-0">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-strawberry font-display text-lg font-bold text-cocoa">
                  {brandName.charAt(0)}
                </span>
                <span className="hidden font-display text-lg font-semibold tracking-normal text-cocoa min-[400px]:inline">
                  {brandName}
                </span>
              </Link>

              <nav aria-label="منوی اصلی" className="hidden items-center gap-1 xl:flex">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `rounded-full px-3 py-2 text-sm font-medium transition ${
                        isActive ? 'bg-blush text-cocoa' : 'text-cocoa/75 hover:bg-blush/60 hover:text-cocoa'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchOpen((s) => !s)}
                  aria-label="جستجوی محصولات"
                  className="grid h-10 w-10 place-items-center rounded-full text-cocoa/80 hover:bg-blush/60"
                >
                  {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </button>
                <Link
                  to={user ? '/wishlist' : '/signin'}
                  aria-label="لیست علاقه‌مندی‌ها"
                  className="hidden h-10 w-10 place-items-center rounded-full text-cocoa/80 hover:bg-blush/60 sm:grid"
                >
                  <Heart className="h-5 w-5" />
                </Link>
                <Link
                  to={user ? '/account' : '/signin'}
                  aria-label={user ? 'حساب کاربری' : 'ورود'}
                  className="grid h-10 w-10 place-items-center rounded-full text-cocoa/80 hover:bg-blush/60"
                >
                  <User className="h-5 w-5" />
                </Link>
                <Link
                  to="/cart"
                  aria-label={`سبد خرید، ${faNum(count)} کالا`}
                  className="relative grid h-10 w-10 place-items-center rounded-full text-cocoa/80 hover:bg-blush/60"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[11px] font-bold text-white">
                      {faNum(count)}
                    </span>
                  )}
                </Link>
                <Link to="/shop" className="btn-dark ms-1 hidden !px-5 !py-2.5 lg:inline-flex">
                  ثبت سفارش
                </Link>
                <button
                  onClick={() => setOpen((o) => !o)}
                  aria-label="باز کردن منو"
                  aria-expanded={open}
                  className="grid h-10 w-10 place-items-center rounded-full text-cocoa/80 hover:bg-blush/60 xl:hidden"
                >
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {searchOpen && (
              <form onSubmit={submitSearch} className="mb-3 flex gap-2" role="search">
                <label htmlFor="site-search" className="sr-only">
                  جستجوی محصولات
                </label>
                <input
                  id="site-search"
                  autoFocus
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="جستجوی ماکارون، کیک، جعبه هدیه…"
                  className="field"
                />
                <button type="submit" className="btn-dark">
                  جستجو
                </button>
              </form>
            )}
          </div>
        </div>

        {open && (
          <div className="container-x xl:hidden">
            <nav
              aria-label="منوی موبایل"
              className="mb-3 grid gap-1 rounded-4xl border border-cocoa/10 bg-white p-3 shadow-soft"
            >
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium ${
                      isActive ? 'bg-blush text-cocoa' : 'text-cocoa/80 hover:bg-blush/50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link to="/shop" className="btn-dark mt-1 w-full">
                ثبت سفارش
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
