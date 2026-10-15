import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool, query, setSetting } from './db.js';
import { DEFAULT_SETTINGS, IMG } from './settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CATEGORIES = [
  {
    slug: 'macarons',
    name: 'Signature Macarons',
    description: 'Delicate shells, slow-matured ganache, a crisp first bite.',
    accent: 'blush',
    image: IMG('1558326567-98ae2405596b'),
  },
  {
    slug: 'cakes',
    name: 'Celebration Cakes',
    description: 'Layered, glazed and finished by hand for your occasion.',
    accent: 'lavender',
    image: IMG('1578985545062-69928b1d9587'),
  },
  {
    slug: 'cupcakes',
    name: 'Cupcakes',
    description: 'Soft crumb, silky buttercream, playful finishes.',
    accent: 'mint',
    image: IMG('1565958011703-44f9829ba187'),
  },
  {
    slug: 'pastries',
    name: 'French Pastries',
    description: 'Laminated doughs and classic techniques, baked daily.',
    accent: 'butter',
    image: IMG('1509440159596-0249088772ff'),
  },
  {
    slug: 'gift-boxes',
    name: 'Dessert Gift Boxes',
    description: 'Curated boxes to send a little sweetness anywhere.',
    accent: 'strawberry',
    image: IMG('1606313564200-e75d5e30476c'),
  },
  {
    slug: 'seasonal',
    name: 'Seasonal Specials',
    description: 'Small runs built around what is best right now.',
    accent: 'rose',
    image: IMG('1464965911861-746a04b4bca6'),
  },
];

const PRODUCTS = [
  {
    slug: 'strawberry-cloud-macarons',
    name: 'Strawberry Cloud Macarons',
    short: 'Airy almond shells with a whipped strawberry cream.',
    description:
      'Six macarons filled with a whipped strawberry ganache made from peak-season fruit. The shells rest overnight so the texture is soft at the centre and crisp at the edge.',
    price: 1800,
    cat: 'macarons',
    img: '1486427944299-d1955d23e34d',
    gallery: ['1486427944299-d1955d23e34d', '1519869325930-281384150729', '1464965911861-746a04b4bca6'],
    flavors: ['Strawberry', 'Vanilla', 'Pistachio'],
    variants: [
      { label: 'Box of 6', priceCents: 1800 },
      { label: 'Box of 12', priceCents: 3300 },
      { label: 'Box of 24', priceCents: 6200 },
    ],
    featured: true,
    bestseller: true,
    rating: 4.9,
    reviews: 128,
    prep: 'Ready in 2 hours',
  },
  {
    slug: 'rose-vanilla-macarons',
    name: 'Rose Vanilla Macarons',
    short: 'Madagascan vanilla and a whisper of rose.',
    description:
      'A classic pairing: slow-infused vanilla bean ganache lifted with a drop of rose water. Finished with a hand-painted petal.',
    price: 1900,
    cat: 'macarons',
    img: '1519869325930-281384150729',
    gallery: ['1519869325930-281384150729', '1558326567-98ae2405596b'],
    flavors: ['Rose', 'Vanilla', 'Raspberry'],
    variants: [
      { label: 'Box of 6', priceCents: 1900 },
      { label: 'Box of 12', priceCents: 3500 },
    ],
    featured: true,
    rating: 4.8,
    reviews: 74,
    prep: 'Ready in 2 hours',
  },
  {
    slug: 'raspberry-celebration-cake',
    name: 'Raspberry Celebration Cake',
    short: 'Vanilla sponge, raspberry compote, mascarpone cream.',
    description:
      'Three layers of vanilla sponge soaked in raspberry syrup, layered with tart compote and mascarpone cream, finished with a soft blush glaze and fresh berries.',
    price: 5400,
    cat: 'cakes',
    img: '1578985545062-69928b1d9587',
    gallery: ['1578985545062-69928b1d9587', '1535141192574-5d4897c12636', '1464349095431-e9a21285b5f3'],
    flavors: ['Raspberry', 'Vanilla', 'Chocolate'],
    variants: [
      { label: '6" · serves 8', priceCents: 5400 },
      { label: '8" · serves 14', priceCents: 7200 },
      { label: '10" · serves 22', priceCents: 9400 },
    ],
    featured: true,
    bestseller: true,
    customizable: true,
    rating: 5.0,
    reviews: 41,
    prep: 'Order 48h ahead',
  },
  {
    slug: 'classic-french-vanilla-cupcakes',
    name: 'Classic French Vanilla Cupcakes',
    short: 'Buttery sponge and a generous swirl of vanilla buttercream.',
    description:
      'Baked in small batches with French butter and real vanilla. Each cupcake is piped to order so the buttercream stays glossy.',
    price: 1500,
    cat: 'cupcakes',
    img: '1495147466023-ac5c588e2e94',
    gallery: ['1495147466023-ac5c588e2e94', '1517686469429-8bdb88b9f907'],
    flavors: ['Vanilla', 'Chocolate', 'Lemon'],
    variants: [
      { label: 'Box of 4', priceCents: 1500 },
      { label: 'Box of 12', priceCents: 3900 },
    ],
    bestseller: true,
    rating: 4.7,
    reviews: 96,
    prep: 'Ready in 1 hour',
  },
  {
    slug: 'pistachio-cream-pastries',
    name: 'Pistachio Cream Pastries',
    short: 'Laminated pastry filled with Sicilian pistachio cream.',
    description:
      'Hand-laminated dough, baked until shatteringly crisp, then filled with a slow-cooked pistachio pastry cream and dusted with crushed nuts.',
    price: 1200,
    cat: 'pastries',
    img: '1555507036-ab1f4038808a',
    gallery: ['1555507036-ab1f4038808a', '1551024506-0bccd828d307'],
    flavors: ['Pistachio', 'Almond'],
    variants: [{ label: 'Each', priceCents: 1200 }, { label: 'Box of 6', priceCents: 6600 }],
    bestseller: true,
    rating: 4.8,
    reviews: 63,
    prep: 'Ready in 1 hour',
  },
  {
    slug: 'signature-dessert-box',
    name: 'Signature Dessert Box',
    short: 'A curated box of our pastry team’s favourites.',
    description:
      'Twelve pieces selected each morning by our pastry chef — a rotating mix of macarons, mini tarts, financiers and choux. The perfect gift.',
    price: 4200,
    cat: 'gift-boxes',
    img: '1606313564200-e75d5e30476c',
    gallery: ['1606313564200-e75d5e30476c', '1587241321921-91a834d6d191'],
    flavors: ['Assorted'],
    variants: [{ label: 'Box of 12', priceCents: 4200 }, { label: 'Box of 24', priceCents: 7800 }],
    featured: true,
    rating: 4.9,
    reviews: 52,
    prep: 'Ready in 3 hours',
  },
  {
    slug: 'lemon-meringue-tart',
    name: 'Lemon Meringue Tart',
    short: 'Sharp lemon curd, torched Italian meringue.',
    description:
      'A crisp sablé base, bright lemon curd and a cloud of torched meringue. Best eaten the day it arrives.',
    price: 1400,
    cat: 'pastries',
    img: '1551024506-0bccd828d307',
    gallery: ['1551024506-0bccd828d307'],
    flavors: ['Lemon'],
    variants: [{ label: 'Each', priceCents: 1400 }],
    rating: 4.6,
    reviews: 33,
    prep: 'Ready in 2 hours',
  },
  {
    slug: 'dark-chocolate-layer-cake',
    name: 'Dark Chocolate Layer Cake',
    short: 'Deep cocoa sponge, silky ganache, a pinch of sea salt.',
    description:
      'Four layers of dark cocoa sponge with whipped ganache and a fine flake of sea salt on top. Rich, but never heavy.',
    price: 5800,
    cat: 'cakes',
    img: '1535141192574-5d4897c12636',
    gallery: ['1535141192574-5d4897c12636', '1578985545062-69928b1d9587'],
    flavors: ['Dark Chocolate', 'Salted Caramel'],
    variants: [
      { label: '6" · serves 8', priceCents: 5800 },
      { label: '8" · serves 14', priceCents: 7600 },
    ],
    customizable: true,
    rating: 4.9,
    reviews: 58,
    prep: 'Order 48h ahead',
  },
  {
    slug: 'pistachio-raspberry-cake',
    name: 'Pistachio & Raspberry Cake',
    short: 'Pistachio sponge, raspberry gel, rose cream.',
    description:
      'Our signature celebration cake: pistachio sponge, sharp raspberry gel and lightly rose-scented cream, finished with fresh berries and crushed pistachio.',
    price: 6400,
    cat: 'cakes',
    img: '1464349095431-e9a21285b5f3',
    gallery: ['1464349095431-e9a21285b5f3', '1535141192574-5d4897c12636'],
    flavors: ['Pistachio', 'Raspberry'],
    variants: [
      { label: '6" · serves 8', priceCents: 6400 },
      { label: '8" · serves 14', priceCents: 8400 },
    ],
    featured: true,
    customizable: true,
    rating: 4.9,
    reviews: 37,
    prep: 'Order 48h ahead',
  },
  {
    slug: 'strawberry-shortcake-cupcakes',
    name: 'Strawberry Shortcake Cupcakes',
    short: 'Vanilla sponge, strawberry cream, fresh fruit.',
    description:
      'A lighter cupcake: vanilla sponge cored and filled with strawberry compote, topped with whipped cream and a slice of fresh strawberry.',
    price: 1600,
    cat: 'cupcakes',
    img: '1517686469429-8bdb88b9f907',
    gallery: ['1517686469429-8bdb88b9f907', '1495147466023-ac5c588e2e94'],
    flavors: ['Strawberry', 'Vanilla'],
    variants: [{ label: 'Box of 4', priceCents: 1600 }, { label: 'Box of 12', priceCents: 4200 }],
    seasonal: true,
    rating: 4.8,
    reviews: 44,
    prep: 'Ready in 1 hour',
  },
  {
    slug: 'butter-croissants',
    name: 'Butter Croissants',
    short: '72-hour laminated dough, French butter.',
    description:
      'Our croissants take three days: a slow ferment, careful lamination and a hot bake for a honeycomb crumb and shattering crust.',
    price: 600,
    cat: 'pastries',
    img: '1555507036-ab1f4038808a',
    gallery: ['1555507036-ab1f4038808a', '1509440159596-0249088772ff'],
    flavors: ['Classic', 'Almond'],
    variants: [{ label: 'Each', priceCents: 600 }, { label: 'Box of 4', priceCents: 2200 }],
    new: true,
    rating: 4.7,
    reviews: 89,
    prep: 'Ready in 30 min',
  },
  {
    slug: 'seasonal-berry-box',
    name: 'Seasonal Berry Box',
    short: 'A limited box of strawberry-led pastries.',
    description:
      'Only while the fruit is at its best: strawberry tarts, berry macarons and a small strawberry cream cake, boxed together.',
    price: 3600,
    cat: 'seasonal',
    img: '1464965911861-746a04b4bca6',
    gallery: ['1464965911861-746a04b4bca6', '1486427944299-d1955d23e34d'],
    flavors: ['Strawberry', 'Raspberry', 'Mixed Berry'],
    variants: [{ label: 'Box of 6', priceCents: 3600 }, { label: 'Box of 12', priceCents: 6800 }],
    seasonal: true,
    new: true,
    rating: 4.8,
    reviews: 21,
    prep: 'Ready in 3 hours',
  },
  {
    slug: 'caramel-eclair',
    name: 'Salted Caramel Éclair',
    short: 'Choux pastry, caramel crème, crisp glaze.',
    description:
      'A classic éclair with a crackling glaze and a salted caramel crème pâtissière. Filled to order.',
    price: 1100,
    cat: 'pastries',
    img: '1587241321921-91a834d6d191',
    gallery: ['1587241321921-91a834d6d191'],
    flavors: ['Salted Caramel', 'Chocolate', 'Vanilla'],
    variants: [{ label: 'Each', priceCents: 1100 }],
    rating: 4.6,
    reviews: 29,
    prep: 'Ready in 2 hours',
  },
  {
    slug: 'celebration-gift-box',
    name: 'Celebration Gift Box',
    short: 'Macarons, chocolates and a handwritten note.',
    description:
      'A gift-ready box of our finest petits fours with a ribbon and a handwritten note card. Add a message at checkout.',
    price: 5200,
    cat: 'gift-boxes',
    img: '1587241321921-91a834d6d191',
    gallery: ['1587241321921-91a834d6d191', '1606313564200-e75d5e30476c'],
    flavors: ['Assorted'],
    variants: [{ label: 'Classic', priceCents: 5200 }, { label: 'Deluxe', priceCents: 8600 }],
    featured: true,
    rating: 4.9,
    reviews: 18,
    prep: 'Ready in 3 hours',
  },
  {
    slug: 'pistachio-macarons',
    name: 'Pistachio Macarons',
    short: 'Roasted pistachio ganache in a soft shell.',
    description:
      'We roast and grind the pistachios ourselves for a ganache that tastes green and nutty rather than sweet.',
    price: 2000,
    cat: 'macarons',
    img: '1558326567-98ae2405596b',
    gallery: ['1558326567-98ae2405596b', '1519869325930-281384150729'],
    flavors: ['Pistachio'],
    variants: [{ label: 'Box of 6', priceCents: 2000 }, { label: 'Box of 12', priceCents: 3800 }],
    new: true,
    rating: 4.8,
    reviews: 26,
    prep: 'Ready in 2 hours',
  },
  {
    slug: 'vanilla-bean-cheesecake',
    name: 'Vanilla Bean Cheesecake',
    short: 'Baked cheesecake, vanilla bean, berry coulis.',
    description:
      'A slow-baked cheesecake on a buttery biscuit base, served with a sharp berry coulis to balance the richness.',
    price: 4600,
    cat: 'cakes',
    img: '1535141192574-5d4897c12636',
    gallery: ['1535141192574-5d4897c12636'],
    flavors: ['Vanilla', 'Berry'],
    variants: [{ label: '8" · serves 12', priceCents: 4600 }],
    rating: 4.7,
    reviews: 22,
    prep: 'Order 24h ahead',
  },
  {
    slug: 'raspberry-macarons',
    name: 'Raspberry Macarons',
    short: 'Sharp raspberry ganache in a blush shell.',
    description:
      'A bright, fruity macaron with a raspberry ganache that keeps its edge against the sweet shell.',
    price: 1800,
    cat: 'macarons',
    img: '1464965911861-746a04b4bca6',
    gallery: ['1464965911861-746a04b4bca6', '1486427944299-d1955d23e34d'],
    flavors: ['Raspberry'],
    variants: [{ label: 'Box of 6', priceCents: 1800 }, { label: 'Box of 12', priceCents: 3300 }],
    seasonal: true,
    rating: 4.7,
    reviews: 31,
    prep: 'Ready in 2 hours',
  },
  {
    slug: 'mini-tart-selection',
    name: 'Mini Tart Selection',
    short: 'Six mini tarts across our classic flavours.',
    description:
      'Lemon, chocolate, pistachio, berry, caramel and vanilla — six mini tarts in a presentation box.',
    price: 2800,
    cat: 'gift-boxes',
    img: '1550617931-e17a7b70dce2',
    gallery: ['1550617931-e17a7b70dce2', '1621303837174-89787a7d4729'],
    flavors: ['Assorted'],
    variants: [{ label: 'Box of 6', priceCents: 2800 }],
    rating: 4.8,
    reviews: 17,
    prep: 'Ready in 3 hours',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sample review — Amélie R.',
    location: 'Old Town',
    rating: 5,
    body: 'The raspberry celebration cake was the centrepiece of our table. Delicate, not too sweet, and beautifully finished.',
  },
  {
    name: 'Sample review — Daniel K.',
    location: 'Riverside',
    rating: 5,
    body: 'Ordered a dessert box as a gift and it arrived perfectly packed. The macarons are the best I have had outside Paris.',
  },
  {
    name: 'Sample review — Priya S.',
    location: 'North Quarter',
    rating: 4,
    body: 'The pistachio pastries are worth the trip. I only wish they did not sell out so quickly on weekends.',
  },
];

const PROMOTIONS = [
  { code: 'SWEET10', kind: 'percent', value: 10, min: 3000, limit: 500 },
  { code: 'FRAISE5', kind: 'fixed', value: 500, min: 2500, limit: 200 },
];

async function seed() {
  const { rows: existing } = await query('SELECT COUNT(*)::int AS n FROM products');
  if (existing[0].n > 0) {
    console.log('Seed skipped — products already present.');
    return;
  }

  for (const [i, c] of CATEGORIES.entries()) {
    await query(
      `INSERT INTO categories (slug, name, description, image_url, accent, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING`,
      [c.slug, c.name, c.description, c.image, c.accent, i]
    );
  }

  const { rows: cats } = await query('SELECT id, slug FROM categories');
  const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  for (const [i, p] of PRODUCTS.entries()) {
    await query(
      `INSERT INTO products
        (slug, name, short_description, description, price_cents, category_id, image_url,
         gallery, flavors, variants, ingredients, allergens, storage, prep_time,
         is_featured, is_bestseller, is_seasonal, is_new, in_stock, rating, review_count,
         is_customizable, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,true,$19,$20,$21,$22)
       ON CONFLICT (slug) DO NOTHING`,
      [
        p.slug,
        p.name,
        p.short,
        p.description,
        p.price,
        catId[p.cat] ?? null,
        IMG(p.img),
        JSON.stringify((p.gallery || [p.img]).map((g) => IMG(g))),
        JSON.stringify(p.flavors || []),
        JSON.stringify(p.variants || []),
        'Wheat flour, sugar, eggs, butter, cream. Full ingredient list provided with every order.',
        'Contains wheat, egg, dairy. May contain traces of nuts. Prepared in a kitchen that handles nuts and sesame.',
        'Keep refrigerated. Best enjoyed within 48 hours.',
        p.prep || 'Ready in 2 hours',
        !!p.featured,
        !!p.bestseller,
        !!p.seasonal,
        !!p.new,
        p.rating ?? 0,
        p.reviews ?? 0,
        !!p.customizable,
        i,
      ]
    );
  }

  for (const [i, t] of TESTIMONIALS.entries()) {
    await query(
      `INSERT INTO testimonials (name, location, rating, body, is_sample, approved, sort_order)
       VALUES ($1,$2,$3,$4,true,true,$5)`,
      [t.name, t.location, t.rating, t.body, i]
    );
  }

  for (const p of PROMOTIONS) {
    await query(
      `INSERT INTO promotions (code, kind, value, min_subtotal_cents, usage_limit, active)
       VALUES ($1,$2,$3,$4,$5,true) ON CONFLICT (code) DO NOTHING`,
      [p.code, p.kind, p.value, p.min, p.limit]
    );
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await setSetting(key, value);
  }

  const adminPass = await bcrypt.hash('Maison123!', 10);
  const demoPass = await bcrypt.hash('Demo123!', 10);
  await query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1,$2,$3,'admin'), ($4,$5,$6,'customer')
     ON CONFLICT (email) DO NOTHING`,
    [
      'admin@maisonfraise.test',
      adminPass,
      'Maison Admin',
      'demo@maisonfraise.test',
      demoPass,
      'Demo Customer',
    ]
  );

  console.log('Seed complete.');
}

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

try {
  await query(schema);
  console.log('Schema applied.');
  await seed();
} catch (err) {
  console.error('Migration failed:', err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
