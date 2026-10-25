import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Leaf, Clock } from 'lucide-react';
import { api, qs } from '../lib/api.js';
import { money } from '../lib/format.js';
import { useSite } from '../context/SiteContext.jsx';
import Reveal from '../components/Reveal.jsx';
import ScrollHero from '../components/ScrollHero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import StarRating from '../components/StarRating.jsx';
import { PHOTOS } from '../lib/images.js';
import { useToast } from '../context/ToastContext.jsx';

const ACCENT_BG = {
  blush: 'bg-blush',
  lavender: 'bg-lavender',
  mint: 'bg-mint',
  butter: 'bg-butter',
  strawberry: 'bg-strawberry/70',
  rose: 'bg-rose/25',
};

function SectionHeading({ eyebrow, title, subtitle, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h-display mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      {subtitle && <p className="mt-3 text-base leading-relaxed text-muted">{subtitle}</p>}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="h-56 bg-blush/60" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded bg-blush/60" />
        <div className="h-3 w-full rounded bg-blush/40" />
        <div className="h-8 w-24 rounded-full bg-blush/50" />
      </div>
    </div>
  );
}

export default function Home() {
  const { content, symbol } = useSite();
  const { success, error } = useToast();
  const [categories, setCategories] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [seasonal, setSeasonal] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/categories'),
      api.get(`/products${qs({ bestseller: 'true', sort: 'featured' })}`),
      api.get(`/products${qs({ seasonal: 'true' })}`),
      api.get('/testimonials'),
    ])
      .then(([c, b, s, t]) => {
        if (!active) return;
        setCategories(c.categories || []);
        setBestsellers((b.products || []).slice(0, 6));
        setSeasonal((s.products || []).slice(0, 3));
        setTestimonials(t.testimonials || []);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const hero = content?.hero;
  const subscribe = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/newsletter', { email });
      success(res.message || 'ایمیل شما ثبت شد.');
      setEmail('');
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-4">
      {/* A — HERO (scroll-driven cinematic video) */}
      <ScrollHero hero={hero} />

      {/* B — EDITORIAL MACARON SHOWCASE */}
      <section className="container-x mt-20">
        <div className="grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="relative h-full overflow-hidden rounded-5xl bg-blush p-8 sm:p-10">
              <p className="font-hand text-2xl text-rose">با عشق ساخته شده</p>
              <h2 className="h-display mt-1 text-[2.75rem] leading-[1.15] sm:text-[3.5rem]">
                طعم‌های
                <br />
                تازه
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-cocoa/75">
                ماکارون‌ها همان روزی که فروخته می‌شوند پر می‌شوند — توت‌فرنگی، گل رز، پسته و تمشک،
                یک شب استراحت می‌کنند تا مغز نرم و پوسته‌ای ترد داشته باشند.
              </p>
              <Link to="/category/macarons" className="btn-dark mt-7">
                خرید ماکارون‌ها
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
              <img
                src={PHOTOS.macarons[1]}
                alt=""
                aria-hidden
                className="absolute -bottom-6 end-6 h-24 w-24 rounded-3xl object-cover shadow-soft animate-floaty sm:h-32 sm:w-32"
              />
            </div>
          </Reveal>

          <div className="grid gap-4 lg:col-span-5">
            <Reveal delay={80}>
              <div className="overflow-hidden rounded-5xl bg-white p-3 shadow-card">
                <img
                  src={PHOTOS.macarons[2]}
                  alt="دسته‌ای ماکارون پاستلی"
                  loading="lazy"
                  className="h-56 w-full rounded-[2rem] object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={140}>
              <div className="grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-5xl bg-white p-3 shadow-card">
                  <img
                    src={PHOTOS.fruit[0]}
                    alt="توت‌فرنگی تازه"
                    loading="lazy"
                    className="h-40 w-full rounded-[1.75rem] object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-5xl bg-white p-3 shadow-card">
                  <img
                    src={PHOTOS.cupcakes[2]}
                    alt="کاپ‌کیک‌های تزئین‌شده"
                    loading="lazy"
                    className="h-40 w-full rounded-[1.75rem] object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* C — SHOP BY CATEGORY */}
      <section className="container-x mt-20">
        <SectionHeading
          eyebrow="گشت‌وگذار"
          title={content?.categoriesTitle || 'خرید بر اساس دسته‌بندی'}
          subtitle={content?.categoriesSubtitle}
        />

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-64 animate-pulse bg-blush/40" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => {
              const large = i === 0 || i === 5;
              return (
                <Reveal
                  key={cat.id}
                  delay={i * 60}
                  className={large ? 'sm:col-span-2 lg:col-span-2' : ''}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`group relative flex h-full min-h-[220px] flex-col justify-end overflow-hidden rounded-5xl p-7 shadow-card transition hover:shadow-soft ${
                      ACCENT_BG[cat.accent] || 'bg-blush'
                    }`}
                  >
                    <img
                      src={cat.image_url}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cocoa/75 via-cocoa/25 to-transparent" />
                    <div className="relative text-cream">
                      <h3 className="font-display text-2xl font-semibold">{cat.name}</h3>
                      <p className="mt-1 max-w-sm text-sm text-cream/85">{cat.description}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cream">
                        مشاهده <ArrowRight className="h-4 w-4 rtl:-scale-x-100 transition group-hover:-translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* D — BESTSELLERS */}
      <section className="container-x mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="محبوب مشتریان همیشگی"
            title={content?.bestsellersTitle || 'محبوب‌ترین دسرهای ما'}
            subtitle={content?.bestsellersSubtitle}
          />
          <Link to="/shop" className="btn-ghost">
            مشاهده همه دسرها
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [0, 1, 2].map((i) => <CardSkeleton key={i} />)
            : bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* E — SIGNATURE CAKE BANNER */}
      <section className="container-x mt-20">
        <Reveal>
          <div className="grid overflow-hidden rounded-5xl bg-mint lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="eyebrow">کیک سفارشی</p>
              <h2 className="h-display mt-3 text-3xl sm:text-4xl">
                {content?.cakeBanner?.headline || 'برای لحظه‌های خاص شما ساخته شده'}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-cocoa/75">
                {content?.cakeBanner?.body}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={content?.cakeBanner?.primaryCta?.href || '/custom-cake'} className="btn-dark">
                  {content?.cakeBanner?.primaryCta?.label || 'طراحی کیک شما'}
                </Link>
                <Link to={content?.cakeBanner?.secondaryCta?.href || '/category/cakes'} className="btn-ghost">
                  {content?.cakeBanner?.secondaryCta?.label || 'مشاهده کیک‌ها'}
                </Link>
              </div>
              <ul className="mt-8 grid gap-3 text-sm text-cocoa/80 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose" /> انتخاب اندازه، طعم و مغزی
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose" /> پیام شخصی‌سازی‌شده
                </li>
                <li className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-rose" /> تزئین با میوه فصل
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-rose" /> ۴۸ ساعت زمان لازم است
                </li>
              </ul>
            </div>
            <div className="relative min-h-[280px]">
              <img
                src={PHOTOS.cakes[2]}
                alt="کیک لایه‌ای جشن با تزئین لطیف"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* F — SEASONAL COLLECTION */}
      <section className="container-x mt-20">
        <SectionHeading
          eyebrow="تولید محدود"
          title={content?.seasonal?.title || 'مجموعه فصلی'}
          subtitle={content?.seasonal?.subtitle}
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {seasonal.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <Link
                to={`/product/${p.slug}`}
                className="group block overflow-hidden rounded-5xl bg-white p-3 shadow-card"
              >
                <img
                  src={p.image_url}
                  alt={p.name}
                  loading="lazy"
                  className="h-52 w-full rounded-[2rem] object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="p-4">
                  <h3 className="font-display text-lg font-semibold text-cocoa group-hover:text-rose">
                    {p.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{p.short_description}</p>
                  <p className="mt-3 font-display text-lg font-semibold text-cocoa">
                    {money(p.price_cents, symbol)}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
          {!loading && seasonal.length === 0 && (
            <div className="card p-8 text-sm text-muted lg:col-span-3">
              در حال حاضر دسر فصلی فعالی نداریم — به‌زودی دوباره سر بزنید.
            </div>
          )}
        </div>
      </section>

      {/* G — BRAND STORY */}
      <section className="container-x mt-20">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-4">
              <img
                src={PHOTOS.pastries[0]}
                alt="شیرینی‌ها روی توری خنک می‌شوند"
                loading="lazy"
                className="h-64 w-full rounded-4xl object-cover shadow-card"
              />
              <img
                src={PHOTOS.desserts[1]}
                alt="قناد در حال تکمیل یک دسر"
                loading="lazy"
                className="mt-8 h-64 w-full rounded-4xl object-cover shadow-card"
              />
            </div>
            <div>
              <p className="eyebrow">هنر دست</p>
              <h2 className="h-display mt-3 text-3xl sm:text-4xl">
                {content?.story?.title || 'داستان ما'}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted">{content?.story?.body}</p>
              <Link to={content?.story?.link?.href || '/our-story'} className="btn-ghost mt-7">
                {content?.story?.link?.label || 'داستان ما را بخوانید'}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* H — TESTIMONIALS */}
      <section className="container-x mt-20">
        <SectionHeading
          eyebrow="از زبان مشتریان"
          title="مشتریان چه می‌گویند"
          subtitle="تا زمانی که فروشگاه تازه است، نظرات نمونه نمایش داده می‌شود — با رسیدن نظرات واقعی جایگزین می‌شوند."
          align="center"
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 70}>
              <figure className="card flex h-full flex-col p-7">
                <StarRating value={t.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-cocoa/80">
                  «{t.body}»
                </blockquote>
                <figcaption className="mt-5 border-t border-cocoa/10 pt-4">
                  <p className="text-sm font-semibold text-cocoa">{t.name}</p>
                  <p className="text-xs text-muted">{t.location}</p>
                  {t.is_sample && (
                    <p className="mt-2 chip bg-butter/70 text-cocoa">نظر نمونه</p>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* I — NEWSLETTER */}
      <section className="container-x mt-20">
        <Reveal>
          <div className="rounded-5xl bg-lavender px-6 py-12 text-center sm:px-12">
            <p className="font-hand text-2xl text-rose">در جریان باشید</p>
            <h2 className="h-display mt-1 text-3xl sm:text-4xl">
              {content?.newsletter?.title || 'کمی شیرینی در صندوق ایمیل شما'}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-cocoa/75">
              {content?.newsletter?.body}
            </p>
            <form onSubmit={subscribe} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
              <label htmlFor="home-newsletter" className="sr-only">
                نشانی ایمیل
              </label>
              <input
                id="home-newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="field ltr"
              />
              <button type="submit" disabled={busy} className="btn-dark shrink-0">
                {busy ? 'در حال عضویت…' : 'عضویت'}
              </button>
            </form>
            <p className="mt-3 text-xs text-cocoa/60">
              با عضویت، موافقت می‌کنید ایمیل‌های گاه‌به‌گاه دریافت کنید. هر زمان می‌توانید لغو کنید.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
