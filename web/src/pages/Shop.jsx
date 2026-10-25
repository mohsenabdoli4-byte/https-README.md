import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { api, qs } from '../lib/api.js';
import { faNum } from '../lib/format.js';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';

const SORTS = [
  { value: 'featured', label: 'پیشنهاد ما' },
  { value: 'price-asc', label: 'قیمت: از کم به زیاد' },
  { value: 'price-desc', label: 'قیمت: از زیاد به کم' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'bestseller', label: 'پرفروش‌ترین' },
  { value: 'rating', label: 'بیشترین امتیاز' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(
    () => ({
      q: params.get('q') || '',
      category: params.get('category') || '',
      sort: params.get('sort') || 'featured',
      flavor: params.get('flavor') || '',
      max: params.get('max') || '',
      inStock: params.get('inStock') || '',
      bestseller: params.get('bestseller') || '',
      new: params.get('new') || '',
      seasonal: params.get('seasonal') || '',
    }),
    [params]
  );

  useEffect(() => {
    api.get('/categories').then((d) => setCategories(d.categories || []));
    api.get('/flavors').then((d) => setFlavors(d.flavors || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products${qs(filters)}`)
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, [filters]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    setParams(next, { replace: true });
  };

  const activeCount = ['category', 'flavor', 'max', 'inStock', 'bestseller', 'new', 'seasonal'].filter(
    (k) => params.get(k)
  ).length;

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="label">دسته‌بندی</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => update({ category: '' })}
            className={`chip ${!filters.category ? 'bg-cocoa text-cream' : 'bg-cream ring-1 ring-cocoa/10'}`}
          >
            همه
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => update({ category: c.slug })}
              className={`chip ${
                filters.category === c.slug ? 'bg-cocoa text-cream' : 'bg-cream ring-1 ring-cocoa/10'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="filter-flavor">
          طعم
        </label>
        <select
          id="filter-flavor"
          value={filters.flavor}
          onChange={(e) => update({ flavor: e.target.value })}
          className="field"
        >
          <option value="">همه طعم‌ها</option>
          {flavors.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="filter-max">
          حداکثر قیمت
        </label>
        <select
          id="filter-max"
          value={filters.max}
          onChange={(e) => update({ max: e.target.value })}
          className="field"
        >
          <option value="">هر قیمتی</option>
          <option value="1500">زیر ۱۵ تومان</option>
          <option value="3000">زیر ۳۰ تومان</option>
          <option value="5000">زیر ۵۰ تومان</option>
          <option value="10000">زیر ۱۰۰ تومان</option>
        </select>
      </div>

      <div className="space-y-2">
        <h3 className="label">فیلترهای سریع</h3>
        {[
          { key: 'inStock', label: 'موجود' },
          { key: 'bestseller', label: 'پرفروش‌ها' },
          { key: 'new', label: 'تازه‌ها' },
          { key: 'seasonal', label: 'فصلی' },
        ].map((f) => (
          <label key={f.key} className="flex cursor-pointer items-center gap-3 text-sm text-cocoa/80">
            <input
              type="checkbox"
              checked={filters[f.key] === 'true'}
              onChange={(e) => update({ [f.key]: e.target.checked ? 'true' : '' })}
              className="h-4 w-4 rounded border-cocoa/30 accent-rose"
            />
            {f.label}
          </label>
        ))}
      </div>

      {activeCount > 0 && (
        <button
          onClick={() => setParams(filters.q ? { q: filters.q } : {}, { replace: true })}
          className="btn-ghost w-full"
        >
          پاک کردن فیلترها
        </button>
      )}
    </div>
  );

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">منوی کامل</p>
          <h1 className="h-display mt-2 text-4xl sm:text-5xl">
            {filters.q ? `نتایج برای «${filters.q}»` : 'خرید همه دسرها'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {loading ? 'در حال بارگذاری…' : `${faNum(products.length)} دسر`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters((s) => !s)} className="btn-ghost lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            فیلترها {activeCount > 0 && `(${faNum(activeCount)})`}
          </button>
          <div>
            <label htmlFor="sort" className="sr-only">
              مرتب‌سازی محصولات
            </label>
            <select
              id="sort"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value })}
              className="field !w-auto"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 card p-6 lg:hidden">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">فیلترها</h2>
            <button onClick={() => setShowFilters(false)} aria-label="بستن فیلترها">
              <X className="h-5 w-5" />
            </button>
          </div>
          {FilterPanel}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 card p-6">{FilterPanel}</div>
        </aside>

        <div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card h-80 animate-pulse bg-blush/40" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <h2 className="font-display text-2xl font-semibold">چیزی با این فیلترها پیدا نشد</h2>
              <p className="mt-2 text-sm text-muted">
                محدوده قیمت را گسترده‌تر کنید یا یکی از فیلترها را بردارید.
              </p>
              <button
                onClick={() => setParams(filters.q ? { q: filters.q } : {}, { replace: true })}
                className="btn-dark mt-6"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 60}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
