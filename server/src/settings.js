export const IMG = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Default site settings + homepage content. Editable from the admin dashboard.
export const DEFAULT_SETTINGS = {
  brand: {
    name: 'Maison Fraise',
    tagline: 'قنادی دست‌ساز فرانسوی',
    logoText: 'Maison Fraise',
    colors: {
      strawberry: '#E99AA8',
      rose: '#C95C70',
      blush: '#FBE2E2',
      cream: '#FFF9F3',
      lavender: '#DCD3E8',
      mint: '#E0EBDD',
      butter: '#F7E8B0',
      cocoa: '#38272B',
      muted: '#82777A',
    },
  },
  contact: {
    email: 'hello@maisonfraise.test',
    phone: '+98 21 8877 0142',
    address: 'تهران، خیابان ولیعصر، پلاک ۱۸',
    hours: [
      { day: 'شنبه تا چهارشنبه', time: '۹:۰۰ – ۱۹:۰۰' },
      { day: 'پنجشنبه', time: '۹:۰۰ – ۲۱:۰۰' },
      { day: 'جمعه', time: '۱۰:۰۰ – ۱۷:۰۰' },
    ],
    social: [
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'Pinterest', href: 'https://pinterest.com' },
      { label: 'Facebook', href: 'https://facebook.com' },
    ],
  },
  commerce: {
    currency: 'IRT',
    currencySymbol: 'تومان',
    taxRate: 0.08,
    deliveryFeeCents: 600,
    freeDeliveryThresholdCents: 7500,
    pickupEnabled: true,
    deliveryZones: ['ونک', 'سعادت‌آباد', 'جردن', 'نیاوران', 'شریعتی'],
    leadTimeDays: 1,
    maxDailyOrders: 40,
    paymentProvider: 'test',
    paymentConfigured: false,
  },
  announcement: {
    enabled: true,
    text: 'ارسال رایگان در تهران برای سفارش‌های بالای ۷۵ تومان · تحویل حضوری همان‌روز',
    href: '/shop',
  },
  content: {
    hero: {
      eyebrow: 'هر روز صبح تازه پخته می‌شود',
      headline: 'تکه‌ای کوچک از شیرینی',
      subtext: 'دسرهای دست‌ساز، طعم‌های لطیف، لحظه‌های به‌یادماندنی.',
      primaryCta: { label: 'مشاهده محصولات', href: '/shop' },
      secondaryCta: { label: 'سفارش کیک سفارشی', href: '/custom-cake' },
      image: IMG('1578985545062-69928b1d9587', 1400),
    },
    categoriesTitle: 'خرید بر اساس دسته‌بندی',
    categoriesSubtitle:
      'از ماکارون‌های لطیف تا کیک‌های جشن، هر جعبه به سفارش شما ساخته می‌شود.',
    bestsellersTitle: 'محبوب‌ترین دسرهای ما',
    bestsellersSubtitle: 'دسرهایی که مشتریان همیشگی ما دوباره و دوباره سفارش می‌دهند.',
    seasonal: {
      title: 'مجموعه فصل توت‌فرنگی',
      subtitle: 'شیرینی‌های محدود بر پایه توت‌فرنگی فصل.',
      activeFrom: '2026-04-01',
      activeTo: '2026-07-31',
    },
    cakeBanner: {
      headline: 'برای لحظه‌های خاص شما ساخته شده',
      body: 'تولد، عروسی یا یک سه‌شنبه آرام — تیم قنادی ما هر کیک را بر اساس مناسبت، طعم و تزئین دلخواه شما طراحی می‌کند.',
      primaryCta: { label: 'طراحی کیک شما', href: '/custom-cake' },
      secondaryCta: { label: 'مشاهده کیک‌ها', href: '/category/cakes' },
    },
    story: {
      title: 'داستان ما',
      body: 'میسون فریز در آشپزخانه‌ای کوچک با میزی سنگی و این باور سرسختانه آغاز شد که دسر باید مثل یک آیین کوچک باشد. هر روز صبح، در دسته‌های کوچک و با میوه فصل و کره فرانسوی، همه‌چیز را با دست لایه‌لایه می‌کنیم، قیف می‌زنیم و لعاب می‌دهیم.',
      link: { label: 'داستان ما را بخوانید', href: '/our-story' },
    },
    newsletter: {
      title: 'کمی شیرینی در صندوق ایمیل شما',
      body: 'منوی فصلی، مجموعه‌های تازه و گاهی یک دستور پخت — حداکثر ماهی دو بار.',
    },
    footer: {
      description:
        'قنادی کوچک فرانسوی که هر روز ماکارون، کیک، کاپ‌کیک و شیرینی را با دست و در دسته‌های کوچک می‌پزد.',
      columns: [
        {
          title: 'فروشگاه',
          links: [
            { label: 'همه دسرها', href: '/shop' },
            { label: 'کیک‌ها', href: '/category/cakes' },
            { label: 'ماکارون‌ها', href: '/category/macarons' },
            { label: 'جعبه‌های هدیه', href: '/category/gift-boxes' },
          ],
        },
        {
          title: 'پشتیبانی',
          links: [
            { label: 'تماس با ما', href: '/contact' },
            { label: 'پرسش‌های متداول', href: '/faq' },
            { label: 'ارسال و تحویل', href: '/shipping' },
            { label: 'حساب کاربری من', href: '/account' },
          ],
        },
        {
          title: 'قوانین',
          links: [
            { label: 'سیاست حفظ حریم خصوصی', href: '/privacy' },
            { label: 'قوانین و مقررات', href: '/terms' },
            { label: 'مرجوعی و لغو سفارش', href: '/shipping' },
          ],
        },
      ],
    },
  },
};
