import { Router } from 'express';
import { query, getSetting, setSetting } from '../db.js';
import { requireAdmin } from '../auth.js';
import { DEFAULT_SETTINGS } from '../settings.js';

const router = Router();
router.use(requireAdmin);

router.get('/stats', async (_req, res) => {
  const [orders, revenue, statuses, bestsellers, subscribers, products] = await Promise.all([
    query('SELECT COUNT(*)::int AS n FROM orders'),
    query(
      `SELECT COALESCE(SUM(total_cents),0)::int AS revenue, COALESCE(AVG(total_cents),0)::int AS aov
       FROM orders WHERE payment_status = 'paid'`
    ),
    query('SELECT status, COUNT(*)::int AS n FROM orders GROUP BY status'),
    query(
      `SELECT p.id, p.name, p.image_url, SUM((i->>'quantity')::int)::int AS sold
       FROM orders o, jsonb_array_elements(o.items) i
       JOIN products p ON p.id = (i->>'productId')::int
       GROUP BY p.id, p.name, p.image_url ORDER BY sold DESC LIMIT 5`
    ),
    query('SELECT COUNT(*)::int AS n FROM subscribers'),
    query('SELECT COUNT(*)::int AS n FROM products WHERE archived = false'),
  ]);

  const recent = await query('SELECT id, order_number, email, total_cents, status, created_at FROM orders ORDER BY created_at DESC LIMIT 8');

  res.json({
    totalOrders: orders.rows[0].n,
    revenueCents: revenue.rows[0].revenue,
    averageOrderCents: revenue.rows[0].aov,
    statusBreakdown: statuses.rows,
    bestsellers: bestsellers.rows,
    subscribers: subscribers.rows[0].n,
    productCount: products.rows[0].n,
    recentOrders: recent.rows,
  });
});

// ---- Products ----
router.get('/products', async (_req, res) => {
  const { rows } = await query(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.sort_order, p.id`
  );
  res.json({ products: rows });
});

router.post('/products', async (req, res) => {
  const b = req.body || {};
  if (!b.name || b.priceCents == null)
    return res.status(400).json({ error: 'Name and price are required.' });
  const slug = (b.slug || b.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const { rows } = await query(
    `INSERT INTO products
      (slug, name, short_description, description, price_cents, category_id, image_url, gallery,
       flavors, variants, ingredients, allergens, storage, prep_time, is_featured, is_bestseller,
       is_seasonal, is_new, in_stock, is_customizable, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
     RETURNING *`,
    [
      slug,
      b.name,
      b.shortDescription || null,
      b.description || null,
      Number(b.priceCents),
      b.categoryId || null,
      b.imageUrl || null,
      JSON.stringify(b.gallery || []),
      JSON.stringify(b.flavors || []),
      JSON.stringify(b.variants || []),
      b.ingredients || null,
      b.allergens || null,
      b.storage || null,
      b.prepTime || null,
      !!b.isFeatured,
      !!b.isBestseller,
      !!b.isSeasonal,
      !!b.isNew,
      b.inStock !== false,
      !!b.isCustomizable,
      Number(b.sortOrder || 0),
    ]
  );
  res.status(201).json({ product: rows[0] });
});

router.put('/products/:id', async (req, res) => {
  const b = req.body || {};
  const { rows } = await query(
    `UPDATE products SET
       name = COALESCE($1,name), short_description = COALESCE($2,short_description),
       description = COALESCE($3,description), price_cents = COALESCE($4,price_cents),
       category_id = $5, image_url = COALESCE($6,image_url),
       gallery = COALESCE($7,gallery), flavors = COALESCE($8,flavors), variants = COALESCE($9,variants),
       ingredients = COALESCE($10,ingredients), allergens = COALESCE($11,allergens),
       storage = COALESCE($12,storage), prep_time = COALESCE($13,prep_time),
       is_featured = COALESCE($14,is_featured), is_bestseller = COALESCE($15,is_bestseller),
       is_seasonal = COALESCE($16,is_seasonal), is_new = COALESCE($17,is_new),
       in_stock = COALESCE($18,in_stock), is_customizable = COALESCE($19,is_customizable),
       archived = COALESCE($20,archived)
     WHERE id = $21 RETURNING *`,
    [
      b.name ?? null,
      b.shortDescription ?? null,
      b.description ?? null,
      b.priceCents != null ? Number(b.priceCents) : null,
      b.categoryId ?? null,
      b.imageUrl ?? null,
      b.gallery ? JSON.stringify(b.gallery) : null,
      b.flavors ? JSON.stringify(b.flavors) : null,
      b.variants ? JSON.stringify(b.variants) : null,
      b.ingredients ?? null,
      b.allergens ?? null,
      b.storage ?? null,
      b.prepTime ?? null,
      b.isFeatured ?? null,
      b.isBestseller ?? null,
      b.isSeasonal ?? null,
      b.isNew ?? null,
      b.inStock ?? null,
      b.isCustomizable ?? null,
      b.archived ?? null,
      req.params.id,
    ]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Product not found.' });
  res.json({ product: rows[0] });
});

router.delete('/products/:id', async (req, res) => {
  await query('UPDATE products SET archived = true WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Orders ----
router.get('/orders', async (req, res) => {
  const { status, q } = req.query;
  const where = [];
  const params = [];
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`(order_number ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }
  const { rows } = await query(
    `SELECT * FROM orders ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY created_at DESC LIMIT 200`,
    params
  );
  res.json({ orders: rows });
});

router.patch('/orders/:id', async (req, res) => {
  const { status, paymentStatus, cancelReason } = req.body || {};
  const { rows } = await query(
    `UPDATE orders SET status = COALESCE($1,status),
       payment_status = COALESCE($2,payment_status),
       cancel_reason = COALESCE($3,cancel_reason)
     WHERE id = $4 RETURNING *`,
    [status ?? null, paymentStatus ?? null, cancelReason ?? null, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order: rows[0] });
});

router.delete('/orders/:id', async (req, res) => {
  await query('DELETE FROM orders WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Content / settings ----
router.get('/settings', async (_req, res) => {
  const keys = ['brand', 'contact', 'commerce', 'announcement', 'content'];
  const out = {};
  for (const k of keys) out[k] = (await getSetting(k)) || DEFAULT_SETTINGS[k];
  res.json({ settings: out });
});

router.put('/settings/:key', async (req, res) => {
  const allowed = ['brand', 'contact', 'commerce', 'announcement', 'content'];
  if (!allowed.includes(req.params.key))
    return res.status(400).json({ error: 'Unknown settings group.' });
  const value = await setSetting(req.params.key, req.body);
  res.json({ key: req.params.key, value });
});

// ---- Promotions ----
router.get('/promotions', async (_req, res) => {
  const { rows } = await query('SELECT * FROM promotions ORDER BY id DESC');
  res.json({ promotions: rows });
});

router.post('/promotions', async (req, res) => {
  const { code, kind = 'percent', value, minSubtotalCents = 0, expiresAt, usageLimit } = req.body || {};
  if (!code || value == null)
    return res.status(400).json({ error: 'Code and value are required.' });
  const { rows } = await query(
    `INSERT INTO promotions (code, kind, value, min_subtotal_cents, expires_at, usage_limit, active)
     VALUES (upper($1),$2,$3,$4,$5,$6,true) RETURNING *`,
    [code, kind, Number(value), Number(minSubtotalCents), expiresAt || null, usageLimit || null]
  );
  res.status(201).json({ promotion: rows[0] });
});

router.patch('/promotions/:id', async (req, res) => {
  const { active } = req.body || {};
  const { rows } = await query(
    'UPDATE promotions SET active = COALESCE($1,active) WHERE id = $2 RETURNING *',
    [active ?? null, req.params.id]
  );
  res.json({ promotion: rows[0] });
});

router.delete('/promotions/:id', async (req, res) => {
  await query('DELETE FROM promotions WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Testimonials ----
router.get('/testimonials', async (_req, res) => {
  const { rows } = await query('SELECT * FROM testimonials ORDER BY sort_order, id');
  res.json({ testimonials: rows });
});

router.post('/testimonials', async (req, res) => {
  const { name, location, rating = 5, body } = req.body || {};
  if (!name || !body) return res.status(400).json({ error: 'Name and body are required.' });
  const { rows } = await query(
    `INSERT INTO testimonials (name, location, rating, body, is_sample, approved)
     VALUES ($1,$2,$3,$4,true,true) RETURNING *`,
    [name, location || null, Number(rating), body]
  );
  res.status(201).json({ testimonial: rows[0] });
});

router.patch('/testimonials/:id', async (req, res) => {
  const { approved } = req.body || {};
  const { rows } = await query(
    'UPDATE testimonials SET approved = COALESCE($1,approved) WHERE id = $2 RETURNING *',
    [approved ?? null, req.params.id]
  );
  res.json({ testimonial: rows[0] });
});

router.delete('/testimonials/:id', async (req, res) => {
  await query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Reviews moderation ----
router.get('/reviews', async (_req, res) => {
  const { rows } = await query(
    `SELECT r.*, p.name AS product_name FROM reviews r
     LEFT JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC`
  );
  res.json({ reviews: rows });
});

router.patch('/reviews/:id', async (req, res) => {
  const { status } = req.body || {};
  const { rows } = await query('UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *', [
    status,
    req.params.id,
  ]);
  res.json({ review: rows[0] });
});

router.get('/subscribers', async (_req, res) => {
  const { rows } = await query('SELECT * FROM subscribers ORDER BY created_at DESC');
  res.json({ subscribers: rows });
});

export default router;
