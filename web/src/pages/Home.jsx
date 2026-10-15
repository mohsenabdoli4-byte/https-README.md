import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Heart, Leaf, Clock, BadgeCheck } from 'lucide-react';
import { api, qs } from '../lib/api.js';
import { useSite } from '../context/SiteContext.jsx';
import Reveal from '../components/Reveal.jsx';
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
      success(res.message || 'You are on the list.');
      setEmail('');
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-4">
      {/* A — HERO */}
      <section className="container-x pt-6">
        <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-butter via-blush to-strawberry/60 px-6 py-12 shadow-soft sm:px-10 sm:py-16 lg:px-14">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/40 blur-2xl"
            aria-hidden
          />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-xl">
              <p className="eyebrow">{hero?.eyebrow}</p>
              <h1 className="h-display mt-4 text-4xl sm:text-5xl lg:text-[4rem]">
                {hero?.headline}
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-cocoa/75 sm:text-lg">
                {hero?.subtext}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={hero?.primaryCta?.href || '/shop'} className="btn-dark">
                  {hero?.primaryCta?.label || 'Explore Our Collection'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to={hero?.secondaryCta?.href || '/custom-cake'} className="btn-ghost">
                  {hero?.secondaryCta?.label || 'Order a Custom Cake'}
                </Link>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
                {[
                  { icon: Truck, label: 'Local delivery' },
                  { icon: Clock, label: 'Baked to order' },
                  { icon: BadgeCheck, label: 'Hand finished' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 text-xs font-semibold text-cocoa/80">
                    <f.icon className="h-4 w-4 text-rose" />
                    {f.label}
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-[2.5rem] bg-white/40 p-3 shadow-soft">
                <img
                  src={hero?.image || PHOTOS.cakes[0]}
                  alt="A celebration cake finished with fresh berries"
                  className="h-[320px] w-full rounded-[2rem] object-cover sm:h-[420px]"
                />
              </div>
              <img
                src={PHOTOS.macarons[0]}
                alt=""
                aria-hidden
                className="absolute -left-4 bottom-8 h-20 w-20 rounded-3xl object-cover shadow-soft animate-floaty sm:h-24 sm:w-24"
              />
              <img
                src={PHOTOS.macarons[3]}
                alt=""
                aria-hidden
                className="absolute -right-3 top-6 h-16 w-16 rounded-2xl object-cover shadow-soft animate-floatySlow sm:h-20 sm:w-20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* B — EDITORIAL MACARON SHOWCASE */}
      <section className="container-x mt-20">
        <div className="grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="relative h-full overflow-hidden rounded-5xl bg-blush p-8 sm:p-10">
              <p className="font-hand text-2xl text-rose">made with love</p>
              <h2 className="h-display mt-1 text-[3.25rem] leading-[0.95] sm:text-[4.5rem]">
                FRESH
                <br />
                FLAVORS
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-cocoa/75">
                Macarons filled the morning they are sold — strawberry, rose, pistachio and raspberry,
                rested overnight for a soft centre and a crisp shell.
              </p>
              <Link to="/category/macarons" className="btn-dark mt-7">
                Shop macarons
                <ArrowRight className="h-4 w-4" />
              </Link>
              <img
                src={PHOTOS.macarons[1]}
                alt=""
                aria-hidden
                className="absolute -bottom-6 right-6 h-24 w-24 rounded-3xl object-cover shadow-soft animate-floaty sm:h-32 sm:w-32"
              />
            </div>
          </Reveal>

          <div className="grid gap-4 lg:col-span-5">
            <Reveal delay={80}>
              <div className="overflow-hidden rounded-5xl bg-white p-3 shadow-card">
                <img
                  src={PHOTOS.macarons[2]}
                  alt="A stack of pastel macarons"
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
                    alt="Fresh strawberries"
                    loading="lazy"
                    className="h-40 w-full rounded-[1.75rem] object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-5xl bg-white p-3 shadow-card">
                  <img
                    src={PHOTOS.cupcakes[2]}
                    alt="Frosted cupcakes"
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
          eyebrow="Explore"
          title={content?.categoriesTitle || 'Shop by Category'}
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
                        Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
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
            eyebrow="Loved by our regulars"
            title={content?.bestsellersTitle || 'Our Most-Loved Treats'}
            subtitle={content?.bestsellersSubtitle}
          />
          <Link to="/shop" className="btn-ghost">
            View all desserts
            <ArrowRight className="h-4 w-4" />
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
              <p className="eyebrow">Custom cakes</p>
              <h2 className="h-display mt-3 text-3xl sm:text-4xl">
                {content?.cakeBanner?.headline || 'Made for Your Special Moments'}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-cocoa/75">
                {content?.cakeBanner?.body}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={content?.cakeBanner?.primaryCta?.href || '/custom-cake'} className="btn-dark">
                  {content?.cakeBanner?.primaryCta?.label || 'Design Your Cake'}
                </Link>
                <Link to={content?.cakeBanner?.secondaryCta?.href || '/category/cakes'} className="btn-ghost">
                  {content?.cakeBanner?.secondaryCta?.label || 'Explore Cakes'}
                </Link>
              </div>
              <ul className="mt-8 grid gap-3 text-sm text-cocoa/80 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose" /> Choose size, flavour and filling
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose" /> Personalised message
                </li>
                <li className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-rose" /> Seasonal fruit finishes
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-rose" /> 48 hours' notice
                </li>
              </ul>
            </div>
            <div className="relative min-h-[280px]">
              <img
                src={PHOTOS.cakes[2]}
                alt="A layered celebration cake with delicate frosting"
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
          eyebrow="Limited run"
          title={content?.seasonal?.title || 'Seasonal Collection'}
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
                    {symbol}
                    {(p.price_cents / 100).toFixed(2)}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
          {!loading && seasonal.length === 0 && (
            <div className="card p-8 text-sm text-muted lg:col-span-3">
              No seasonal desserts are running right now — check back soon.
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
                alt="Pastries cooling on a rack"
                loading="lazy"
                className="h-64 w-full rounded-4xl object-cover shadow-card"
              />
              <img
                src={PHOTOS.desserts[1]}
                alt="A pastry chef finishing a dessert"
                loading="lazy"
                className="mt-8 h-64 w-full rounded-4xl object-cover shadow-card"
              />
            </div>
            <div>
              <p className="eyebrow">Craft</p>
              <h2 className="h-display mt-3 text-3xl sm:text-4xl">
                {content?.story?.title || 'Our Story'}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted">{content?.story?.body}</p>
              <Link to={content?.story?.link?.href || '/our-story'} className="btn-ghost mt-7">
                {content?.story?.link?.label || 'Read our story'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* H — TESTIMONIALS */}
      <section className="container-x mt-20">
        <SectionHeading
          eyebrow="Kind words"
          title="What our customers say"
          subtitle="Sample reviews shown while the store is new — real customer reviews replace them as they arrive."
          align="center"
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 70}>
              <figure className="card flex h-full flex-col p-7">
                <StarRating value={t.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-cocoa/80">
                  “{t.body}”
                </blockquote>
                <figcaption className="mt-5 border-t border-cocoa/10 pt-4">
                  <p className="text-sm font-semibold text-cocoa">{t.name}</p>
                  <p className="text-xs text-muted">{t.location}</p>
                  {t.is_sample && (
                    <p className="mt-2 chip bg-butter/70 text-cocoa">Sample testimonial</p>
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
            <p className="font-hand text-2xl text-rose">stay in the loop</p>
            <h2 className="h-display mt-1 text-3xl sm:text-4xl">
              {content?.newsletter?.title || 'A Little Sweetness in Your Inbox'}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-cocoa/75">
              {content?.newsletter?.body}
            </p>
            <form onSubmit={subscribe} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
              <label htmlFor="home-newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="home-newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="field"
              />
              <button type="submit" disabled={busy} className="btn-dark shrink-0">
                {busy ? 'Joining…' : 'Subscribe'}
              </button>
            </form>
            <p className="mt-3 text-xs text-cocoa/60">
              By subscribing you agree to receive occasional emails. Unsubscribe any time.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
