import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool, query, getSetting, setSetting } from './db.js';
import { DEFAULT_SETTINGS, IMG } from './settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Bump this when the seeded demo content changes so existing databases are
// refreshed once. After that, admin edits are left untouched.
const SEED_VERSION = 2;

const CATEGORIES = [
  {
    slug: 'macarons',
    name: 'ماکارون‌های امضای ما',
    description: 'پوسته‌های لطیف، گاناش آرام‌بالیده، اولین گاز ترد.',
    accent: 'blush',
    image: IMG('1558326567-98ae2405596b'),
  },
  {
    slug: 'cakes',
    name: 'کیک‌های جشن',
    description: 'لایه‌لایه، لعاب‌دار و با دست برای مناسبت شما تزئین‌شده.',
    accent: 'lavender',
    image: IMG('1578985545062-69928b1d9587'),
  },
  {
    slug: 'cupcakes',
    name: 'کاپ‌کیک‌ها',
    description: 'بافت نرم، کره‌ای ابریشمی، تزئین‌های بازیگوش.',
    accent: 'mint',
    image: IMG('1565958011703-44f9829ba187'),
  },
  {
    slug: 'pastries',
    name: 'شیرینی‌های فرانسوی',
    description: 'خمیرهای ورقه‌ای و تکنیک‌های کلاسیک، هر روز تازه پخته.',
    accent: 'butter',
    image: IMG('1509440159596-0249088772ff'),
  },
  {
    slug: 'gift-boxes',
    name: 'جعبه‌های هدیه دسر',
    description: 'جعبه‌های چیده‌شده برای فرستادن کمی شیرینی به هر جا.',
    accent: 'strawberry',
    image: IMG('1606313564200-e75d5e30476c'),
  },
  {
    slug: 'seasonal',
    name: 'ویژه‌های فصلی',
    description: 'تولید محدود بر پایه بهترین‌های همین فصل.',
    accent: 'rose',
    image: IMG('1464965911861-746a04b4bca6'),
  },
];

const PRODUCTS = [
  {
    slug: 'strawberry-cloud-macarons',
    name: 'ماکارون ابری توت‌فرنگی',
    short: 'پوسته‌های بادامی سبک با خامه توت‌فرنگی هم‌زده.',
    description:
      'شش ماکارون پر شده با گاناش توت‌فرنگی هم‌زده که از میوه فصل تهیه شده است. پوسته‌ها یک شب استراحت می‌کنند تا بافت مغز نرم و لبه‌ها ترد باشد.',
    price: 1800,
    cat: 'macarons',
    img: '1486427944299-d1955d23e34d',
    gallery: ['1486427944299-d1955d23e34d', '1519869325930-281384150729', '1464965911861-746a04b4bca6'],
    flavors: ['توت‌فرنگی', 'وانیل', 'پسته'],
    variants: [
      { label: 'جعبه ۶ عددی', priceCents: 1800 },
      { label: 'جعبه ۱۲ عددی', priceCents: 3300 },
      { label: 'جعبه ۲۴ عددی', priceCents: 6200 },
    ],
    featured: true,
    bestseller: true,
    rating: 4.9,
    reviews: 128,
    prep: 'آماده در ۲ ساعت',
  },
  {
    slug: 'rose-vanilla-macarons',
    name: 'ماکارون گل رز و وانیل',
    short: 'وانیل ماداگاسکار و رایحه‌ای از گل رز.',
    description:
      'یک جفت کلاسیک: گاناش وانیل که آرام دم کشیده و با چند قطره گلاب تلطیف شده است. با گلبرگی که با دست نقاشی شده، تزئین می‌شود.',
    price: 1900,
    cat: 'macarons',
    img: '1519869325930-281384150729',
    gallery: ['1519869325930-281384150729', '1558326567-98ae2405596b'],
    flavors: ['گل رز', 'وانیل', 'تمشک'],
    variants: [
      { label: 'جعبه ۶ عددی', priceCents: 1900 },
      { label: 'جعبه ۱۲ عددی', priceCents: 3500 },
    ],
    featured: true,
    rating: 4.8,
    reviews: 74,
    prep: 'آماده در ۲ ساعت',
  },
  {
    slug: 'raspberry-celebration-cake',
    name: 'کیک جشن تمشک',
    short: 'اسفنج وانیلی، کمپوت تمشک، خامه ماسکارپونه.',
    description:
      'سه لایه اسفنج وانیلی آغشته به شربت تمشک، لایه‌لایه با کمپوت ترش و خامه ماسکارپونه، با لعاب صورتی ملایم و توت تازه تزئین شده است.',
    price: 5400,
    cat: 'cakes',
    img: '1578985545062-69928b1d9587',
    gallery: ['1578985545062-69928b1d9587', '1535141192574-5d4897c12636', '1464349095431-e9a21285b5f3'],
    flavors: ['تمشک', 'وانیل', 'شکلات'],
    variants: [
      { label: '۶ اینچ · برای ۸ نفر', priceCents: 5400 },
      { label: '۸ اینچ · برای ۱۴ نفر', priceCents: 7200 },
      { label: '۱۰ اینچ · برای ۲۲ نفر', priceCents: 9400 },
    ],
    featured: true,
    bestseller: true,
    customizable: true,
    rating: 5.0,
    reviews: 41,
    prep: 'سفارش ۴۸ ساعت قبل',
  },
  {
    slug: 'classic-french-vanilla-cupcakes',
    name: 'کاپ‌کیک وانیلی کلاسیک فرانسوی',
    short: 'اسفنج کره‌ای و خامه وانیلی فراوان.',
    description:
      'در دسته‌های کوچک با کره فرانسوی و وانیل طبیعی پخته می‌شود. هر کاپ‌کیک به سفارش قیف می‌شود تا خامه براق بماند.',
    price: 1500,
    cat: 'cupcakes',
    img: '1495147466023-ac5c588e2e94',
    gallery: ['1495147466023-ac5c588e2e94', '1517686469429-8bdb88b9f907'],
    flavors: ['وانیل', 'شکلات', 'لیمو'],
    variants: [
      { label: 'جعبه ۴ عددی', priceCents: 1500 },
      { label: 'جعبه ۱۲ عددی', priceCents: 3900 },
    ],
    bestseller: true,
    rating: 4.7,
    reviews: 96,
    prep: 'آماده در ۱ ساعت',
  },
  {
    slug: 'pistachio-cream-pastries',
    name: 'شیرینی کرم پسته',
    short: 'خمیر ورقه‌ای پر شده با کرم پسته سیسیلی.',
    description:
      'خمیر دست‌ساز ورقه‌ای، تا حد ترد شدن پخته و سپس با کرم پسته آرام‌پخته پر و با پسته کوبیده پوشیده می‌شود.',
    price: 1200,
    cat: 'pastries',
    img: '1555507036-ab1f4038808a',
    gallery: ['1555507036-ab1f4038808a', '1551024506-0bccd828d307'],
    flavors: ['پسته', 'بادام'],
    variants: [{ label: 'تکی', priceCents: 1200 }, { label: 'جعبه ۶ عددی', priceCents: 6600 }],
    bestseller: true,
    rating: 4.8,
    reviews: 63,
    prep: 'آماده در ۱ ساعت',
  },
  {
    slug: 'signature-dessert-box',
    name: 'جعبه دسر امضای ما',
    short: 'جعبه‌ای چیده‌شده از محبوب‌های تیم قنادی ما.',
    description:
      'دوازده عدد که هر روز صبح توسط قناد ما انتخاب می‌شود — ترکیبی چرخشی از ماکارون، تارت کوچک، فینانسیه و شو. هدیه‌ای بی‌نقص.',
    price: 4200,
    cat: 'gift-boxes',
    img: '1606313564200-e75d5e30476c',
    gallery: ['1606313564200-e75d5e30476c', '1587241321921-91a834d6d191'],
    flavors: ['متنوع'],
    variants: [{ label: 'جعبه ۱۲ عددی', priceCents: 4200 }, { label: 'جعبه ۲۴ عددی', priceCents: 7800 }],
    featured: true,
    rating: 4.9,
    reviews: 52,
    prep: 'آماده در ۳ ساعت',
  },
  {
    slug: 'lemon-meringue-tart',
    name: 'تارت لیمو و مرنگ',
    short: 'کرم لیموی تازه، مرنگ ایتالیایی کاراملی‌شده.',
    description:
      'پایه سابله ترد، کرم لیموی پرطراوت و ابری از مرنگ کاراملی‌شده. بهترین زمان خوردن، همان روزی است که می‌رسد.',
    price: 1400,
    cat: 'pastries',
    img: '1551024506-0bccd828d307',
    gallery: ['1551024506-0bccd828d307'],
    flavors: ['لیمو'],
    variants: [{ label: 'تکی', priceCents: 1400 }],
    rating: 4.6,
    reviews: 33,
    prep: 'آماده در ۲ ساعت',
  },
  {
    slug: 'dark-chocolate-layer-cake',
    name: 'کیک لایه‌ای شکلات تلخ',
    short: 'اسفنج کاکائویی عمیق، گاناش ابریشمی، کمی نمک دریا.',
    description:
      'چهار لایه اسفنج کاکائوی تلخ با گاناش هم‌زده و پولکی نازکی از نمک دریا روی آن. غنی، اما هرگز سنگین.',
    price: 5800,
    cat: 'cakes',
    img: '1535141192574-5d4897c12636',
    gallery: ['1535141192574-5d4897c12636', '1578985545062-69928b1d9587'],
    flavors: ['شکلات تلخ', 'کارامل نمکی'],
    variants: [
      { label: '۶ اینچ · برای ۸ نفر', priceCents: 5800 },
      { label: '۸ اینچ · برای ۱۴ نفر', priceCents: 7600 },
    ],
    customizable: true,
    rating: 4.9,
    reviews: 58,
    prep: 'سفارش ۴۸ ساعت قبل',
  },
  {
    slug: 'pistachio-raspberry-cake',
    name: 'کیک پسته و تمشک',
    short: 'اسفنج پسته، ژل تمشک، خامه گل رز.',
    description:
      'کیک جشن امضای ما: اسفنج پسته، ژل تمشک پرطراوت و خامه‌ای با رایحه ملایم گل رز، تزئین‌شده با توت تازه و پسته کوبیده.',
    price: 6400,
    cat: 'cakes',
    img: '1464349095431-e9a21285b5f3',
    gallery: ['1464349095431-e9a21285b5f3', '1535141192574-5d4897c12636'],
    flavors: ['پسته', 'تمشک'],
    variants: [
      { label: '۶ اینچ · برای ۸ نفر', priceCents: 6400 },
      { label: '۸ اینچ · برای ۱۴ نفر', priceCents: 8400 },
    ],
    featured: true,
    customizable: true,
    rating: 4.9,
    reviews: 37,
    prep: 'سفارش ۴۸ ساعت قبل',
  },
  {
    slug: 'strawberry-shortcake-cupcakes',
    name: 'کاپ‌کیک توت‌فرنگی',
    short: 'اسفنج وانیلی، خامه توت‌فرنگی، میوه تازه.',
    description:
      'کاپ‌کیکی سبک‌تر: اسفنج وانیلی که مغزی‌اش خالی و با کمپوت توت‌فرنگی پر شده، روی آن خامه هم‌زده و برشی از توت‌فرنگی تازه.',
    price: 1600,
    cat: 'cupcakes',
    img: '1517686469429-8bdb88b9f907',
    gallery: ['1517686469429-8bdb88b9f907', '1495147466023-ac5c588e2e94'],
    flavors: ['توت‌فرنگی', 'وانیل'],
    variants: [{ label: 'جعبه ۴ عددی', priceCents: 1600 }, { label: 'جعبه ۱۲ عددی', priceCents: 4200 }],
    seasonal: true,
    rating: 4.8,
    reviews: 44,
    prep: 'آماده در ۱ ساعت',
  },
  {
    slug: 'butter-croissants',
    name: 'کروسان کره‌ای',
    short: 'خمیر ورقه‌ای ۷۲ ساعته، کره فرانسوی.',
    description:
      'کروسان‌های ما سه روز زمان می‌برند: تخمیر آرام، ورقه‌کردن دقیق و پخت داغ برای بافتی لانه‌زنبوری و پوسته‌ای خردشونده.',
    price: 600,
    cat: 'pastries',
    img: '1555507036-ab1f4038808a',
    gallery: ['1555507036-ab1f4038808a', '1509440159596-0249088772ff'],
    flavors: ['کلاسیک', 'بادام'],
    variants: [{ label: 'تکی', priceCents: 600 }, { label: 'جعبه ۴ عددی', priceCents: 2200 }],
    new: true,
    rating: 4.7,
    reviews: 89,
    prep: 'آماده در ۳۰ دقیقه',
  },
  {
    slug: 'seasonal-berry-box',
    name: 'جعبه توت‌های فصلی',
    short: 'جعبه‌ای محدود از شیرینی‌های توت‌فرنگی‌محور.',
    description:
      'فقط تا وقتی میوه در بهترین حالت خود است: تارت توت‌فرنگی، ماکارون توت و یک کیک کوچک خامه توت‌فرنگی، در یک جعبه.',
    price: 3600,
    cat: 'seasonal',
    img: '1464965911861-746a04b4bca6',
    gallery: ['1464965911861-746a04b4bca6', '1486427944299-d1955d23e34d'],
    flavors: ['توت‌فرنگی', 'تمشک', 'توت مخلوط'],
    variants: [{ label: 'جعبه ۶ عددی', priceCents: 3600 }, { label: 'جعبه ۱۲ عددی', priceCents: 6800 }],
    seasonal: true,
    new: true,
    rating: 4.8,
    reviews: 21,
    prep: 'آماده در ۳ ساعت',
  },
  {
    slug: 'caramel-eclair',
    name: 'اکلر کارامل نمکی',
    short: 'خمیر شو، کرم کارامل، لعاب ترد.',
    description:
      'اکلر کلاسیک با لعابی که زیر دندان می‌شکند و کرم پاتیسیر کارامل نمکی. به سفارش پر می‌شود.',
    price: 1100,
    cat: 'pastries',
    img: '1587241321921-91a834d6d191',
    gallery: ['1587241321921-91a834d6d191'],
    flavors: ['کارامل نمکی', 'شکلات', 'وانیل'],
    variants: [{ label: 'تکی', priceCents: 1100 }],
    rating: 4.6,
    reviews: 29,
    prep: 'آماده در ۲ ساعت',
  },
  {
    slug: 'celebration-gift-box',
    name: 'جعبه هدیه جشن',
    short: 'ماکارون، شکلات و یک یادداشت دست‌نویس.',
    description:
      'جعبه‌ای آماده هدیه از بهترین پتی‌فورهای ما، با روبان و کارت یادداشت دست‌نویس. هنگام تسویه حساب پیام خود را اضافه کنید.',
    price: 5200,
    cat: 'gift-boxes',
    img: '1587241321921-91a834d6d191',
    gallery: ['1587241321921-91a834d6d191', '1606313564200-e75d5e30476c'],
    flavors: ['متنوع'],
    variants: [{ label: 'کلاسیک', priceCents: 5200 }, { label: 'لوکس', priceCents: 8600 }],
    featured: true,
    rating: 4.9,
    reviews: 18,
    prep: 'آماده در ۳ ساعت',
  },
  {
    slug: 'pistachio-macarons',
    name: 'ماکارون پسته',
    short: 'گاناش پسته بوداده در پوسته‌ای نرم.',
    description:
      'پسته‌ها را خودمان بو می‌دهیم و آسیاب می‌کنیم تا گاناشی به دست آید که طعم سبز و مغزدار دارد، نه فقط شیرین.',
    price: 2000,
    cat: 'macarons',
    img: '1558326567-98ae2405596b',
    gallery: ['1558326567-98ae2405596b', '1519869325930-281384150729'],
    flavors: ['پسته'],
    variants: [{ label: 'جعبه ۶ عددی', priceCents: 2000 }, { label: 'جعبه ۱۲ عددی', priceCents: 3800 }],
    new: true,
    rating: 4.8,
    reviews: 26,
    prep: 'آماده در ۲ ساعت',
  },
  {
    slug: 'vanilla-bean-cheesecake',
    name: 'چیزکیک وانیلی',
    short: 'چیزکیک پخته، وانیل، سس توت.',
    description:
      'چیزکیکی آرام‌پخته روی پایه بیسکویتی کره‌ای، همراه با سس توت پرطراوت برای تعادل با غنای آن.',
    price: 4600,
    cat: 'cakes',
    img: '1535141192574-5d4897c12636',
    gallery: ['1535141192574-5d4897c12636'],
    flavors: ['وانیل', 'توت'],
    variants: [{ label: '۸ اینچ · برای ۱۲ نفر', priceCents: 4600 }],
    rating: 4.7,
    reviews: 22,
    prep: 'سفارش ۲۴ ساعت قبل',
  },
  {
    slug: 'raspberry-macarons',
    name: 'ماکارون تمشک',
    short: 'گاناش تمشک پرطراوت در پوسته‌ای صورتی.',
    description:
      'ماکارونی روشن و میوه‌ای با گاناش تمشک که طراوت خود را در برابر پوسته شیرین حفظ می‌کند.',
    price: 1800,
    cat: 'macarons',
    img: '1464965911861-746a04b4bca6',
    gallery: ['1464965911861-746a04b4bca6', '1486427944299-d1955d23e34d'],
    flavors: ['تمشک'],
    variants: [{ label: 'جعبه ۶ عددی', priceCents: 1800 }, { label: 'جعبه ۱۲ عددی', priceCents: 3300 }],
    seasonal: true,
    rating: 4.7,
    reviews: 31,
    prep: 'آماده در ۲ ساعت',
  },
  {
    slug: 'mini-tart-selection',
    name: 'مجموعه تارت کوچک',
    short: 'شش تارت کوچک با طعم‌های کلاسیک ما.',
    description:
      'لیمو، شکلات، پسته، توت، کارامل و وانیل — شش تارت کوچک در جعبه‌ای مناسب پذیرایی.',
    price: 2800,
    cat: 'gift-boxes',
    img: '1550617931-e17a7b70dce2',
    gallery: ['1550617931-e17a7b70dce2', '1621303837174-89787a7d4729'],
    flavors: ['متنوع'],
    variants: [{ label: 'جعبه ۶ عددی', priceCents: 2800 }],
    rating: 4.8,
    reviews: 17,
    prep: 'آماده در ۳ ساعت',
  },
];

const TESTIMONIALS = [
  {
    name: 'نظر نمونه — املی ر.',
    location: 'ونک',
    rating: 5,
    body: 'کیک جشن تمشک، نقطه کانونی سفره ما بود. لطیف، نه زیاد شیرین و با تزئینی زیبا.',
  },
  {
    name: 'نظر نمونه — دانیال ک.',
    location: 'جردن',
    rating: 5,
    body: 'یک جعبه دسر به‌عنوان هدیه سفارش دادم و کاملاً سالم و مرتب رسید. ماکارون‌ها بهترین چیزی بودند که بیرون از پاریس خورده‌ام.',
  },
  {
    name: 'نظر نمونه — پریا س.',
    location: 'نیاوران',
    rating: 4,
    body: 'شیرینی‌های پسته‌ای ارزش رفتن دارند. فقط ای کاش آخر هفته‌ها این‌قدر زود تمام نمی‌شدند.',
  },
];

const PROMOTIONS = [
  { code: 'SWEET10', kind: 'percent', value: 10, min: 3000, limit: 500 },
  { code: 'FRAISE5', kind: 'fixed', value: 500, min: 2500, limit: 200 },
];

const INGREDIENTS =
  'آرد گندم، شکر، تخم‌مرغ، کره، خامه. فهرست کامل مواد اولیه همراه هر سفارش ارائه می‌شود.';
const ALLERGENS =
  'حاوی گندم، تخم‌مرغ و لبنیات. ممکن است حاوی اثری از مغزها باشد. در آشپزخانه‌ای تهیه می‌شود که با مغزها و کنجد سر و کار دارد.';
const STORAGE = 'در یخچال نگهداری شود. بهترین زمان مصرف تا ۴۸ ساعت.';

async function seed() {
  const current = await getSetting('seedVersion');
  if (current === SEED_VERSION) {
    console.log(`Seed already at version ${SEED_VERSION}.`);
    return;
  }

  for (const [i, c] of CATEGORIES.entries()) {
    await query(
      `INSERT INTO categories (slug, name, description, image_url, accent, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description,
         image_url = EXCLUDED.image_url, accent = EXCLUDED.accent,
         sort_order = EXCLUDED.sort_order`,
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
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name, short_description = EXCLUDED.short_description,
         description = EXCLUDED.description, price_cents = EXCLUDED.price_cents,
         category_id = EXCLUDED.category_id, image_url = EXCLUDED.image_url,
         gallery = EXCLUDED.gallery, flavors = EXCLUDED.flavors, variants = EXCLUDED.variants,
         ingredients = EXCLUDED.ingredients, allergens = EXCLUDED.allergens,
         storage = EXCLUDED.storage, prep_time = EXCLUDED.prep_time,
         is_featured = EXCLUDED.is_featured, is_bestseller = EXCLUDED.is_bestseller,
         is_seasonal = EXCLUDED.is_seasonal, is_new = EXCLUDED.is_new,
         rating = EXCLUDED.rating, review_count = EXCLUDED.review_count,
         is_customizable = EXCLUDED.is_customizable, sort_order = EXCLUDED.sort_order`,
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
        INGREDIENTS,
        ALLERGENS,
        STORAGE,
        p.prep || 'آماده در ۲ ساعت',
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

  // Sample testimonials are replaced so the demo copy stays in sync with the seed.
  await query('DELETE FROM testimonials WHERE is_sample = true');
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
      'مدیر میسون فریز',
      'demo@maisonfraise.test',
      demoPass,
      'مشتری نمونه',
    ]
  );

  await setSetting('seedVersion', SEED_VERSION);
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
