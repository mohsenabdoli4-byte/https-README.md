import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const productSelect = `
  SELECT p.*, c.slug AS category_slug, c.name AS category_name, c.accent AS category_accent
  FROM products p LEFT JOIN categories c ON c.id = p.category_id
`;

router.get('/categories', async (_req, res) => {
  const { rows } = await query(
    `SELECT c.*, COUNT(p.id)::int AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.archived = false
     GROUP BY c.id ORDER BY c.sort_order, c.id`
  );
  res.json({ categories: rows });
});

router.get('/products', async (req, res) => {
  const {
    category,
    q,
    sort = 'featured',
    min,
    max,
    flavor,
    featured,
    seasonal,
    bestseller,
    new: isNew,
    inStock,
  } = req.query;

  const where = ['p.archived = false'];
  const params = [];
  const add = (sql, value) => {
    params.push(value);
    where.push(sql.replace('?', `$${params.length}`));
  };

  if (category) add('c.slug = ?', category);
  if (q) {
    params.push(`%${q}%`);
    const n = params.length;
    where.push(`(p.name ILIKE $${n} OR p.short_description ILIKE $${n})`);
  }
  if (min) add('p.price_cents >= ?', Number(min));
  if (max) add('p.price_cents <= ?', Number(max));
  if (flavor) add('p.flavors::text ILIKE ?', `%${flavor}%`);
  if (featured === 'true') where.push('p.is_featured = true');
  if (seasonal === 'true') where.push('p.is_seasonal = true');
  if (bestseller === 'true') where.push('p.is_bestseller = true');
  if (isNew === 'true') where.push('p.is_new = true');
  if (inStock === 'true') where.push('p.in_stock = true');

  const order =
    {
      'price-asc': 'p.price_cents ASC',
      'price-desc': 'p.price_cents DESC',
      newest: 'p.created_at DESC, p.id DESC',
      bestseller: 'p.is_bestseller DESC, p.review_count DESC',
      rating: 'p.rating DESC',
      featured: 'p.is_featured DESC, p.sort_order ASC',
    }[sort] || 'p.sort_order ASC';

  const { rows } = await query(
    `${productSelect} WHERE ${where.join(' AND ')} ORDER BY ${order}`,
    params
  );
  res.json({ products: rows });
});

router.get('/products/:slug', async (req, res) => {
  const { rows } = await query(`${productSelect} WHERE p.slug = $1`, [req.params.slug]);
  const product = rows[0];
  if (!product) return res.status(404).json({ error: 'محصول پیدا نشد.' });

  const { rows: related } = await query(
    `${productSelect} WHERE p.category_id = $1 AND p.id <> $2 AND p.archived = false
     ORDER BY p.is_featured DESC LIMIT 4`,
    [product.category_id, product.id]
  );
  const { rows: reviews } = await query(
    `SELECT id, name, rating, body, created_at FROM reviews
     WHERE product_id = $1 AND status = 'approved' ORDER BY created_at DESC LIMIT 20`,
    [product.id]
  );
  res.json({ product, related, reviews });
});

router.get('/flavors', async (_req, res) => {
  const { rows } = await query('SELECT flavors FROM products WHERE archived = false');
  const set = new Set();
  rows.forEach((r) => (r.flavors || []).forEach((f) => set.add(f)));
  res.json({ flavors: [...set].sort() });
});

export default router;
