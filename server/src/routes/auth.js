import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from '../auth.js';

const router = Router();

const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  fullName: u.full_name,
  phone: u.phone,
  role: u.role,
});

router.post('/signup', async (req, res) => {
  const { email, password, fullName, phone } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'ایمیل و رمز عبور الزامی است.' });
  if (String(password).length < 8)
    return res.status(400).json({ error: 'رمز عبور باید حداقل ۸ کاراکتر باشد.' });

  const normalized = String(email).trim().toLowerCase();
  const { rows: existing } = await query('SELECT id FROM users WHERE email = $1', [normalized]);
  if (existing.length)
    return res.status(409).json({ error: 'حسابی با این ایمیل از قبل وجود دارد.' });

  const hash = await bcrypt.hash(String(password), 10);
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, full_name, phone, role)
     VALUES ($1,$2,$3,$4,'customer') RETURNING *`,
    [normalized, hash, fullName || null, phone || null]
  );
  const user = rows[0];
  setAuthCookie(res, signToken(user));
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'ایمیل و رمز عبور الزامی است.' });
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [
    String(email).trim().toLowerCase(),
  ]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'ایمیل یا رمز عبور نادرست است.' });
  const ok = await bcrypt.compare(String(password), user.password_hash);
  if (!ok) return res.status(401).json({ error: 'ایمیل یا رمز عبور نادرست است.' });
  setAuthCookie(res, signToken(user));
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'وارد نشده‌اید.' });
  res.json({ user: publicUser(req.user) });
});

router.patch('/profile', requireAuth, async (req, res) => {
  const { fullName, phone } = req.body || {};
  const { rows } = await query(
    `UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone)
     WHERE id = $3 RETURNING *`,
    [fullName ?? null, phone ?? null, req.user.id]
  );
  res.json({ user: publicUser(rows[0]) });
});

router.get('/addresses', requireAuth, async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id DESC',
    [req.user.id]
  );
  res.json({ addresses: rows });
});

router.post('/addresses', requireAuth, async (req, res) => {
  const { label, line1, city, postalCode, isDefault } = req.body || {};
  if (!line1) return res.status(400).json({ error: 'نشانی الزامی است.' });
  if (isDefault)
    await query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
  const { rows } = await query(
    `INSERT INTO addresses (user_id, label, line1, city, postal_code, is_default)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, label || 'خانه', line1, city || null, postalCode || null, !!isDefault]
  );
  res.status(201).json({ address: rows[0] });
});

router.delete('/addresses/:id', requireAuth, async (req, res) => {
  await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [
    req.params.id,
    req.user.id,
  ]);
  res.json({ ok: true });
});

export default router;
