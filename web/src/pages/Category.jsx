import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api, qs } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';

const SORTS = [
  { value: 'featured', label: 'پیشنهاد ما' },
  { value: 'price-asc', label: 'قیمت: از کم به زیاد' },
  { value: 'price-desc', label: 'قیمت: از زیاد به کم' },
  { value: 'rating', label: 'بیشترین امتیاز' },
];

export default function Category() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/categories'),
      api.get(`/products${qs({ category: slug, sort })}`),
    ])
      .then(([c, p]) => {
        setCategory((c.categories || []).find((x) => x.slug === slug) || null);
        setProducts(p.products || []);
      })
      .finally(() => setLoading(false));
  }, [slug, sort]);

  return (
    <div className="container-x py-10">
      <nav aria-label="مسیر صفحه" className="text-xs text-muted">
        <Link to="/" className="hover:text-rose">
          خانه
        </Link>{' '}
        / <Link to="/shop" className="hover:text-rose">فروشگاه</Link> /{' '}
        <span className="text-cocoa">{category?.name || slug}</span>
      </nav>

      <div className="mt-6 overflow-hidden rounded-5xl bg-blush">
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <p className="eyebrow">مجموعه</p>
            <h1 className="h-display mt-3 text-4xl sm:text-5xl">
              {category?.name || 'مجموعه'}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cocoa/75">
              {category?.description}
            </p>
            <div className="mt-7">
              <label htmlFor="cat-sort" className="sr-only">
                مرتب‌سازی محصولات
              </label>
              <select
                id="cat-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
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
          {category?.image_url && (
            <img
              src={category.image_url}
              alt={category.name}
              className="h-64 w-full object-cover lg:h-full"
            />
          )}
        </div>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-80 animate-pulse bg-blush/40" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card p-12 text-center">
            <h2 className="font-display text-2xl font-semibold">این مجموعه خالی است</h2>
            <p className="mt-2 text-sm text-muted">در حال تأمین موجودی هستیم — همه محصولات را ببینید.</p>
            <Link to="/shop" className="btn-dark mt-6">
              خرید همه دسرها
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
