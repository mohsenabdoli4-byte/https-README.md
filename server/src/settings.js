export const IMG = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Default site settings + homepage content. Editable from the admin dashboard.
export const DEFAULT_SETTINGS = {
  brand: {
    name: 'Maison Fraise',
    tagline: 'Handcrafted French patisserie',
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
    phone: '+1 (555) 014-2288',
    address: '18 Rue des Fraises, Old Town',
    hours: [
      { day: 'Mon – Fri', time: '9:00 – 19:00' },
      { day: 'Saturday', time: '9:00 – 21:00' },
      { day: 'Sunday', time: '10:00 – 17:00' },
    ],
    social: [
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'Pinterest', href: 'https://pinterest.com' },
      { label: 'Facebook', href: 'https://facebook.com' },
    ],
  },
  commerce: {
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 0.08,
    deliveryFeeCents: 600,
    freeDeliveryThresholdCents: 7500,
    pickupEnabled: true,
    deliveryZones: ['Old Town', 'Riverside', 'North Quarter', 'Harbour District'],
    leadTimeDays: 1,
    maxDailyOrders: 40,
    paymentProvider: 'test',
    paymentConfigured: false,
  },
  announcement: {
    enabled: true,
    text: 'Free local delivery on orders over $75 · Same-day pickup available',
    href: '/shop',
  },
  content: {
    hero: {
      eyebrow: 'Freshly baked every morning',
      headline: 'A Little Piece of Sweetness',
      subtext:
        'Handcrafted desserts, delicate flavors, unforgettable moments.',
      primaryCta: { label: 'Explore Our Collection', href: '/shop' },
      secondaryCta: { label: 'Order a Custom Cake', href: '/custom-cake' },
      image: IMG('1578985545062-69928b1d9587', 1400),
    },
    categoriesTitle: 'Shop by Category',
    categoriesSubtitle:
      'From delicate macarons to celebration cakes, every box is made to order.',
    bestsellersTitle: 'Our Most-Loved Treats',
    bestsellersSubtitle: 'The desserts our regulars keep coming back for.',
    seasonal: {
      title: 'The Strawberry Season Collection',
      subtitle: 'Limited pastries built around peak-season strawberries.',
      activeFrom: '2026-04-01',
      activeTo: '2026-07-31',
    },
    cakeBanner: {
      headline: 'Made for Your Special Moments',
      body: 'Birthdays, weddings, quiet Tuesdays — our pastry team designs each cake around your occasion, flavors and finish.',
      primaryCta: { label: 'Design Your Cake', href: '/custom-cake' },
      secondaryCta: { label: 'Explore Cakes', href: '/category/cakes' },
    },
    story: {
      title: 'Our Story',
      body: 'Maison Fraise began in a small kitchen with a marble counter and a stubborn belief that dessert should feel like a small ceremony. We fold, pipe and glaze by hand every morning, in small batches, with seasonal fruit and French butter.',
      link: { label: 'Read our story', href: '/our-story' },
    },
    newsletter: {
      title: 'A Little Sweetness in Your Inbox',
      body: 'Seasonal menus, new collections and the occasional recipe — no more than twice a month.',
    },
    footer: {
      description:
        'A small-batch French patisserie baking macarons, cakes, cupcakes and pastries by hand, every day.',
      columns: [
        {
          title: 'Shop',
          links: [
            { label: 'All Desserts', href: '/shop' },
            { label: 'Cakes', href: '/category/cakes' },
            { label: 'Macarons', href: '/category/macarons' },
            { label: 'Gift Boxes', href: '/category/gift-boxes' },
          ],
        },
        {
          title: 'Support',
          links: [
            { label: 'Contact', href: '/contact' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Shipping & Delivery', href: '/shipping' },
            { label: 'My Account', href: '/account' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms & Conditions', href: '/terms' },
            { label: 'Returns & Cancellation', href: '/shipping' },
          ],
        },
      ],
    },
  },
};
