import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Clock,
  AlertTriangle,
  Check,
  ChevronRight,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { money, faNum, formatDate } from '../lib/format.js';
import { useCart } from '../context/CartContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StarRating from '../components/StarRating.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';

const RECENT_KEY = 'maison_fraise_recent_v1';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { symbol, commerce } = useSite();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [variantLabel, setVariantLabel] = useState(null);
  const [flavor, setFlavor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [recent, setRecent] = useState([]);
  const [message, setMessage] = useState('');
  const [review, setReview] = useState({ rating: 5, body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setData(null);
    api
      .get(`/products/${slug}`)
      .then((d) => {
        setData(d);
        setVariantLabel(d.product.variants?.[0]?.label ?? null);
        setFlavor(d.product.flavors?.[0] ?? null);
        setActiveImage(0);
        setQuantity(1);
        try {
          const stored = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
          const next = [d.product.slug, ...stored.filter((s) => s !== d.product.slug)].slice(0, 6);
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
      Promise.all(
        stored
          .filter((s) => s !== slug)
          .slice(0, 4)
          .map((s) => api.get(`/products/${s}`).then((r) => r.product).catch(() => null))
      ).then((items) => setRecent(items.filter(Boolean)));
    } catch {
      /* ignore */
    }
  }, [slug]);

  const product = data?.product;
  const variant = useMemo(
    () => (product?.variants || []).find((v) => v.label === variantLabel),
    [product, variantLabel]
  );
  const unitPrice = variant ? Number(variant.priceCents) : product?.price_cents || 0;
  const cakeSurcharge = product?.is_customizable ? 0 : 0;

  if (loading) {
    return (
      <div className="container-x py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-5xl bg-blush/40" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-blush/50" />
            <div className="h-4 w-full animate-pulse rounded bg-blush/40" />
            <div className="h-12 w-40 animate-pulse rounded-full bg-blush/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="h-display text-3xl">این دسر پیدا نشد</h1>
        <p className="mt-3 text-sm text-muted">ممکن است از منو حذف شده باشد.</p>
        <Link to="/shop" className="btn-dark mt-6">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  const gallery = product.gallery?.length ? product.gallery : [product.image_url];

  const addToCart = () => {
    add(product, {
      variantLabel,
      flavor,
      quantity,
      customization: product.is_customizable && message ? { message } : null,
    });
    success(`${faNum(quantity)} × ${product.name} به سبد خرید اضافه شد.`);
  };

  const wishlist = async () => {
    if (!user) return navigate('/signin');
    try {
      await api.post('/wishlist', { productId: product.id });
      success('به لیست علاقه‌مندی‌ها اضافه شد.');
    } catch (err) {
      error(err.message);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/signin');
    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${product.id}/reviews`, review);
      success(res.message || 'از ثبت نظر شما سپاسگزاریم.');
      setReview({ rating: 5, body: '' });
    } catch (err) {
      error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container-x py-10">
      <nav aria-label="مسیر صفحه" className="text-xs text-muted">
        <Link to="/" className="hover:text-rose">خانه</Link> /{' '}
        <Link to="/shop" className="hover:text-rose">فروشگاه</Link> /{' '}
        {product.category_slug && (
          <>
            <Link to={`/category/${product.category_slug}`} className="hover:text-rose">
              {product.category_name}
            </Link>{' '}
            /{' '}
          </>
        )}
        <span className="text-cocoa">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-5xl bg-white p-3 shadow-card">
            <img
              src={gallery[activeImage]}
              alt={product.name}
              className="h-[380px] w-full rounded-[2rem] object-cover sm:h-[480px]"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3">
              {gallery.map((g, i) => (
                <button
                  key={g}
                  onClick={() => setActiveImage(i)}
                  aria-label={`نمایش تصویر ${faNum(i + 1)}`}
                  className={`overflow-hidden rounded-2xl border-2 p-1 ${
                    activeImage === i ? 'border-rose' : 'border-transparent'
                  }`}
                >
                  <img src={g} alt="" className="h-16 w-16 rounded-xl object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.is_bestseller && <span className="chip bg-cocoa text-cream">پرفروش</span>}
            {product.is_new && <span className="chip bg-mint text-cocoa">جدید</span>}
            {product.is_seasonal && <span className="chip bg-strawberry text-cocoa">فصلی</span>}
            {product.in_stock ? (
              <span className="chip bg-mint text-cocoa">موجود</span>
            ) : (
              <span className="chip bg-muted/20 text-muted">ناموجود</span>
            )}
          </div>

          <h1 className="h-display mt-4 text-4xl sm:text-[2.5rem]">{product.name}</h1>
          <div className="mt-3 flex items-center gap-4">
            <StarRating value={product.rating} count={product.review_count} />
            {product.category_name && (
              <span className="text-xs text-muted">در {product.category_name}</span>
            )}
          </div>
          <p className="mt-5 text-base leading-relaxed text-muted">{product.description}</p>

          <p className="mt-6 font-display text-3xl font-semibold text-cocoa">
            {money(unitPrice * quantity + cakeSurcharge, symbol)}
            {quantity > 1 && (
              <span className="ms-2 text-sm font-normal text-muted">
                ({money(unitPrice, symbol)} هر واحد)
              </span>
            )}
          </p>

          {product.variants?.length > 0 && (
            <div className="mt-6">
              <p className="label">یک گزینه انتخاب کنید</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.label}
                    onClick={() => setVariantLabel(v.label)}
                    className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
                      variantLabel === v.label
                        ? 'border-rose bg-rose/10 text-cocoa'
                        : 'border-cocoa/15 bg-white text-cocoa/75 hover:border-rose/50'
                    }`}
                  >
                    {v.label}
                    <span className="ms-2 text-xs text-muted">
                      {money(v.priceCents, symbol)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.flavors?.length > 0 && (
            <div className="mt-5">
              <p className="label">طعم</p>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFlavor(f)}
                    className={`chip ${
                      flavor === f ? 'bg-cocoa text-cream' : 'bg-cream ring-1 ring-cocoa/10'
                    }`}
                  >
                    {flavor === f && <Check className="me-1 h-3 w-3" />}
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.is_customizable && (
            <div className="mt-5">
              <label htmlFor="cake-message" className="label">
                پیام شخصی‌سازی‌شده (اختیاری)
              </label>
              <input
                id="cake-message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 60))}
                placeholder="تولدت مبارک!"
                className="field"
              />
              <p className="mt-1 text-xs text-muted">{faNum(message.length)}/۶۰ کاراکتر</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-cocoa/15 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="کاهش تعداد"
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-blush/60"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{faNum(quantity)}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                aria-label="افزایش تعداد"
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-blush/60"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={addToCart} disabled={!product.in_stock} className="btn-dark flex-1 sm:flex-none">
              <ShoppingBag className="h-4 w-4" />
              افزودن به سبد خرید
            </button>
            <button onClick={wishlist} className="btn-ghost" aria-label="افزودن به علاقه‌مندی‌ها">
              <Heart className="h-4 w-4" />
              ذخیره
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-cocoa/10">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
              <div>
                <p className="text-sm font-semibold text-cocoa">آماده‌سازی</p>
                <p className="text-xs text-muted">{product.prep_time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-cocoa/10">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
              <div>
                <p className="text-sm font-semibold text-cocoa">ارسال</p>
                <p className="text-xs text-muted">
                  {commerce?.pickupEnabled ? 'ارسال محلی یا تحویل حضوری' : 'ارسال محلی'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4 border-t border-cocoa/10 pt-6 text-sm">
            <details className="group" open>
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-cocoa">
                مواد اولیه و آلرژن‌ها
                <ChevronRight className="h-4 w-4 rtl:-scale-x-100 transition group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-muted">{product.ingredients}</p>
              <p className="mt-2 flex items-start gap-2 text-muted">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                {product.allergens}
              </p>
            </details>
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-cocoa">
                نگهداری
                <ChevronRight className="h-4 w-4 rtl:-scale-x-100 transition group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-muted">{product.storage}</p>
            </details>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="h-display text-2xl sm:text-3xl">نظرات</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {data.reviews.length === 0 ? (
              <div className="card p-6 text-sm text-muted">
                هنوز نظر تأییدشده‌ای ثبت نشده است. اولین نفر باشید.
              </div>
            ) : (
              data.reviews.map((r) => (
                <div key={r.id} className="card p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-cocoa">{r.name}</p>
                    <span className="text-xs text-muted">{formatDate(r.created_at)}</span>
                  </div>
                  <div className="mt-2">
                    <StarRating value={r.rating} />
                  </div>
                  <p className="mt-3 text-sm text-cocoa/80">{r.body}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={submitReview} className="card h-fit p-6">
            <h3 className="font-display text-lg font-semibold">ثبت نظر</h3>
            <p className="mt-1 text-xs text-muted">
              نظرات پیش از نمایش در فروشگاه بررسی می‌شوند.
            </p>
            <div className="mt-4">
              <label htmlFor="review-rating" className="label">
                امتیاز
              </label>
              <select
                id="review-rating"
                value={review.rating}
                onChange={(e) => setReview((r) => ({ ...r, rating: Number(e.target.value) }))}
                className="field"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {faNum(n)} ستاره
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label htmlFor="review-body" className="label">
                نظر شما
              </label>
              <textarea
                id="review-body"
                rows={4}
                value={review.body}
                onChange={(e) => setReview((r) => ({ ...r, body: e.target.value }))}
                className="field"
                placeholder="نظر شما چیست؟"
              />
            </div>
            <button type="submit" disabled={submittingReview} className="btn-dark mt-4 w-full">
              {submittingReview ? 'در حال ارسال…' : user ? 'ثبت نظر' : 'برای ثبت نظر وارد شوید'}
            </button>
          </form>
        </div>
      </section>

      {data.related.length > 0 && (
        <section className="mt-16">
          <h2 className="h-display text-2xl sm:text-3xl">شاید این‌ها را هم دوست داشته باشید</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.related.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-16">
          <h2 className="h-display text-2xl sm:text-3xl">بازدیدهای اخیر</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
