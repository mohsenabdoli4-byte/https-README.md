import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.get('/testimonials', async (_req, res) => {
  const { rows } = await query(
    'SELECT * FROM testimonials WHERE approved = true ORDER BY sort_order, id'
  );
  res.json({ testimonials: rows });
});

router.post('/newsletter', async (req, res) => {
  const email = String((req.body || {}).email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'لطفاً یک ایمیل معتبر وارد کنید.' });
  try {
    await query('INSERT INTO subscribers (email) VALUES ($1)', [email]);
    res.status(201).json({ ok: true, message: 'ایمیل شما ثبت شد. خوش آمدید!' });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است.' });
    throw err;
  }
});

router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message)
    return res.status(400).json({ error: 'نام، ایمیل و پیام الزامی است.' });
  await query(
    'INSERT INTO messages (name, email, subject, message) VALUES ($1,$2,$3,$4)',
    [name, email, subject || null, message]
  );
  res.status(201).json({ ok: true, message: 'سپاس — به‌زودی با شما تماس می‌گیریم.' });
});

router.get('/wishlist', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT w.id AS wishlist_id, p.* FROM wishlists w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
    [req.user.id]
  );
  res.json({ items: rows });
});

router.post('/wishlist', requireAuth, async (req, res) => {
  const { productId } = req.body || {};
  if (!productId) return res.status(400).json({ error: 'شناسه محصول الزامی است.' });
  await query(
    `INSERT INTO wishlists (user_id, product_id) VALUES ($1,$2)
     ON CONFLICT (user_id, product_id) DO NOTHING`,
    [req.user.id, productId]
  );
  res.status(201).json({ ok: true });
});

router.delete('/wishlist/:productId', requireAuth, async (req, res) => {
  await query('DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2', [
    req.user.id,
    req.params.productId,
  ]);
  res.json({ ok: true });
});

router.post('/products/:id/reviews', requireAuth, async (req, res) => {
  const { rating, body } = req.body || {};
  const value = Number(rating);
  if (!value || value < 1 || value > 5)
    return res.status(400).json({ error: 'لطفاً امتیازی بین ۱ تا ۵ انتخاب کنید.' });
  await query(
    `INSERT INTO reviews (product_id, user_id, name, rating, body, status)
     VALUES ($1,$2,$3,$4,$5,'pending')`,
    [req.params.id, req.user.id, req.user.full_name || 'مشتری', value, body || null]
  );
  res.status(201).json({ ok: true, message: 'سپاس — نظر شما در انتظار بررسی است.' });
});

export default router;
