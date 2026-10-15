import jwt from 'jsonwebtoken';
import { query } from './db.js';

const SECRET = process.env.JWT_SECRET || 'maison_fraise_dev_jwt_secret';
export const COOKIE = 'mf_token';

export function signToken(user) {
  return jwt.sign({ uid: user.id, role: user.role }, SECRET, { expiresIn: '30d' });
}

export function setAuthCookie(res, token) {
  const secure = process.env.BASE44_PREVIEW_MODE === '1';
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

function readToken(req) {
  if (req.cookies && req.cookies[COOKIE]) return req.cookies[COOKIE];
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export async function loadUser(req) {
  const token = readToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET);
    const { rows } = await query(
      'SELECT id, email, full_name, phone, role FROM users WHERE id = $1',
      [payload.uid]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function attachUser(req, _res, next) {
  req.user = await loadUser(req);
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Sign in required.' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Sign in required.' });
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Administrator access required.' });
  next();
}
