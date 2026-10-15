import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { attachUser } from './auth.js';
import { getSetting } from './db.js';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import orderRoutes from './routes/orders.js';
import miscRoutes from './routes/misc.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.set('trust proxy', 1);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(attachUser);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'maison-fraise-api' }));

app.get('/api/site', async (_req, res) => {
  const [brand, contact, commerce, announcement, content] = await Promise.all([
    getSetting('brand'),
    getSetting('contact'),
    getSetting('commerce'),
    getSetting('announcement'),
    getSetting('content'),
  ]);
  res.json({ brand, contact, commerce, announcement, content });
});

app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api', orderRoutes);
app.use('/api', miscRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

const port = Number(process.env.PORT || 8000);
app.listen(port, '0.0.0.0', () => {
  console.log(`Maison Fraise API listening on :${port}`);
});
