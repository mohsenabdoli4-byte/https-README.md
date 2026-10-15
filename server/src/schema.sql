-- Maison Fraise schema (idempotent)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'customer',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  accent      TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id               SERIAL PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  short_description TEXT,
  description      TEXT,
  price_cents      INT NOT NULL,
  category_id      INT REFERENCES categories(id) ON DELETE SET NULL,
  image_url        TEXT,
  gallery          JSONB NOT NULL DEFAULT '[]'::jsonb,
  flavors          JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants         JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredients      TEXT,
  allergens        TEXT,
  storage          TEXT,
  prep_time        TEXT,
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  is_bestseller    BOOLEAN NOT NULL DEFAULT false,
  is_seasonal      BOOLEAN NOT NULL DEFAULT false,
  is_new           BOOLEAN NOT NULL DEFAULT false,
  in_stock         BOOLEAN NOT NULL DEFAULT true,
  rating           NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count     INT NOT NULL DEFAULT 0,
  is_customizable  BOOLEAN NOT NULL DEFAULT false,
  sort_order       INT NOT NULL DEFAULT 0,
  archived         BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addresses (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT,
  line1      TEXT NOT NULL,
  city       TEXT,
  postal_code TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  order_number      TEXT UNIQUE NOT NULL,
  user_id           INT REFERENCES users(id) ON DELETE SET NULL,
  email             TEXT NOT NULL,
  customer_name     TEXT,
  phone             TEXT,
  fulfillment       TEXT NOT NULL DEFAULT 'delivery',
  address           TEXT,
  city              TEXT,
  postal_code       TEXT,
  instructions      TEXT,
  delivery_date     DATE,
  time_slot         TEXT,
  subtotal_cents    INT NOT NULL DEFAULT 0,
  discount_cents    INT NOT NULL DEFAULT 0,
  delivery_fee_cents INT NOT NULL DEFAULT 0,
  tax_cents         INT NOT NULL DEFAULT 0,
  total_cents       INT NOT NULL DEFAULT 0,
  promo_code        TEXT,
  status            TEXT NOT NULL DEFAULT 'pending',
  payment_status    TEXT NOT NULL DEFAULT 'unpaid',
  payment_method    TEXT NOT NULL DEFAULT 'test',
  cancel_reason     TEXT,
  items             JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotions (
  id               SERIAL PRIMARY KEY,
  code             TEXT UNIQUE NOT NULL,
  kind             TEXT NOT NULL DEFAULT 'percent',
  value            INT NOT NULL,
  min_subtotal_cents INT NOT NULL DEFAULT 0,
  expires_at       DATE,
  usage_limit      INT,
  used_count       INT NOT NULL DEFAULT 0,
  active           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  user_id    INT REFERENCES users(id) ON DELETE SET NULL,
  name       TEXT,
  rating     INT NOT NULL,
  body       TEXT,
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wishlists (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS subscribers (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id         SERIAL PRIMARY KEY,
  name       TEXT,
  location   TEXT,
  rating     INT NOT NULL DEFAULT 5,
  body       TEXT,
  is_sample  BOOLEAN NOT NULL DEFAULT true,
  approved   BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT,
  email      TEXT,
  subject    TEXT,
  message    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);
