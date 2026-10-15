import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { api, qs } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
  { value: 'bestseller', label: 'Bestselling' },
  { value: 'rating', label: 'Top rated' },
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
        <h3 className="label">Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => update({ category: '' })}
            className={`chip ${!filters.category ? 'bg-cocoa text-cream' : 'bg-cream ring-1 ring-cocoa/10'}`}
          >
            All
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
          Flavour
        </label>
        <select
          id="filter-flavor"
          value={filters.flavor}
          onChange={(e) => update({ flavor: e.target.value })}
          className="field"
        >
          <option value="">Any flavour</option>
          {flavors.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="filter-max">
          Max price
        </label>
        <select
          id="filter-max"
          value={filters.max}
          onChange={(e) => update({ max: e.target.value })}
          className="field"
        >
          <option value="">Any price</option>
          <option value="1500">Under $15</option>
          <option value="3000">Under $30</option>
          <option value="5000">Under $50</option>
          <option value="10000">Under $100</option>
        </select>
      </div>

      <div className="space-y-2">
        <h3 className="label">Quick filters</h3>
        {[
          { key: 'inStock', label: 'Available now' },
          { key: 'bestseller', label: 'Bestsellers' },
          { key: 'new', label: 'New arrivals' },
          { key: 'seasonal', label: 'Seasonal' },
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
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">The full menu</p>
          <h1 className="h-display mt-2 text-4xl sm:text-5xl">
            {filters.q ? `Results for “${filters.q}”` : 'Shop all desserts'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {loading ? 'Loading…' : `${products.length} ${products.length === 1 ? 'dessert' : 'desserts'}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters((s) => !s)} className="btn-ghost lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            Filters {activeCount > 0 && `(${activeCount})`}
          </button>
          <div>
            <label htmlFor="sort" className="sr-only">
              Sort products
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
            <h2 className="font-display text-lg font-semibold">Filters</h2>
            <button onClick={() => setShowFilters(false)} aria-label="Close filters">
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
              <h2 className="font-display text-2xl font-semibold">Nothing matches those filters</h2>
              <p className="mt-2 text-sm text-muted">
                Try widening your price range or clearing a filter.
              </p>
              <button
                onClick={() => setParams(filters.q ? { q: filters.q } : {}, { replace: true })}
                className="btn-dark mt-6"
              >
                Clear filters
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
