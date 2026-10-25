import { Router } from 'express';
import { query, getSetting } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();

export async function validatePromo(code, subtotalCents) {
  if (!code) return { discountCents: 0, promo: null, reason: null };
  const { rows } = await query('SELECT * FROM promotions WHERE upper(code) = upper($1)', [code]);
  const promo = rows[0];
  if (!promo || !promo.active) return { discountCents: 0, promo: null, reason: 'کد نامعتبر است.' };
  if (promo.expires_at && new Date(promo.expires_at) < new Date())
    return { discountCents: 0, promo: null, reason: 'این کد منقضی شده است.' };
  if (promo.usage_limit && promo.used_count >= promo.usage_limit)
    return { discountCents: 0, promo: null, reason: 'این کد به حد استفاده رسیده است.' };
  if (subtotalCents < promo.min_subtotal_cents)
    return {
      discountCents: 0,
      promo: null,
      reason: `حداقل سفارش برای این کد ${(promo.min_subtotal_cents / 100).toLocaleString('fa-IR')} تومان است.`,
    };
  const discountCents =
    promo.kind === 'percent'
      ? Math.round((subtotalCents * promo.value) / 100)
      : Math.min(promo.value, subtotalCents);
  return { discountCents, promo, reason: null };
}

router.post('/promotions/validate', async (req, res) => {
  const { code, subtotalCents = 0 } = req.body || {};
  const result = await validatePromo(code, Number(subtotalCents));
  if (!result.promo)
    return res.status(400).json({ valid: false, error: result.reason || 'کد نامعتبر است.' });
  res.json({
    valid: true,
    code: result.promo.code,
    discountCents: result.discountCents,
  });
});

// Server-authoritative pricing + order creation.
router.post('/orders', async (req, res) => {
  const body = req.body || {};
  const {
    items = [],
    email,
    customerName,
    phone,
    fulfillment = 'delivery',
    address,
    city,
    postalCode,
    instructions,
    deliveryDate,
    timeSlot,
    promoCode,
    paymentMethod = 'test',
  } = body;

  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'سبد خرید شما خالی است.' });
  if (!email) return res.status(400).json({ error: 'نشانی ایمیل الزامی است.' });
  if (fulfillment === 'delivery' && !address)
    return res.status(400).json({ error: 'نشانی تحویل الزامی است.' });

  const commerce = (await getSetting('commerce')) || {};
  const taxRate = Number(commerce.taxRate ?? 0);
  const deliveryFeeCents = Number(commerce.deliveryFeeCents ?? 0);
  const freeThreshold = Number(commerce.freeDeliveryThresholdCents ?? 0);

  const ids = items.map((i) => Number(i.productId)).filter(Boolean);
  const { rows: products } = await query('SELECT * FROM products WHERE id = ANY($1)', [ids]);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  const lineItems = [];
  let subtotalCents = 0;
  for (const raw of items) {
    const product = byId[Number(raw.productId)];
    if (!product || product.archived) continue;
    if (!product.in_stock)
      return res.status(409).json({ error: `${product.name} در حال حاضر موجود نیست.` });

    const variants = product.variants || [];
    let unitPrice = product.price_cents;
    let variantLabel = null;
    if (raw.variantLabel) {
      const variant = variants.find((v) => v.label === raw.variantLabel);
      if (!variant) return res.status(400).json({ error: 'گزینه محصول نامعتبر است.' });
      unitPrice = Number(variant.priceCents);
      variantLabel = variant.label;
    }
    const qty = Math.max(1, Math.min(99, Number(raw.quantity) || 1));
    const lineTotal = unitPrice * qty;
    subtotalCents += lineTotal;
    lineItems.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image_url,
      variantLabel,
      flavor: raw.flavor || null,
      unitPriceCents: unitPrice,
      quantity: qty,
      lineTotalCents: lineTotal,
      customization: raw.customization || null,
    });
  }

  if (lineItems.length === 0)
    return res.status(400).json({ error: 'هیچ‌یک از اقلام سبد خرید شما موجود نیست.' });

  const { discountCents, promo } = await validatePromo(promoCode, subtotalCents);
  const fee =
    fulfillment === 'pickup' || (freeThreshold && subtotalCents >= freeThreshold)
      ? 0
      : deliveryFeeCents;
  const taxable = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round(taxable * taxRate);
  const totalCents = taxable + fee + taxCents;

  const orderNumber = `MF-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 900 + 100
  )}`;

  const { rows } = await query(
    `INSERT INTO orders
      (order_number, user_id, email, customer_name, phone, fulfillment, address, city, postal_code,
       instructions, delivery_date, time_slot, subtotal_cents, discount_cents, delivery_fee_cents,
       tax_cents, total_cents, promo_code, status, payment_status, payment_method, items)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'pending','unpaid',$19,$20)
     RETURNING *`,
    [
      orderNumber,
      req.user ? req.user.id : null,
      email,
      customerName || null,
      phone || null,
      fulfillment,
      address || null,
      city || null,
      postalCode || null,
      instructions || null,
      deliveryDate || null,
      timeSlot || null,
      subtotalCents,
      discountCents,
      fee,
      taxCents,
      totalCents,
      promo ? promo.code : null,
      paymentMethod,
      JSON.stringify(lineItems),
    ]
  );

  if (promo) {
    await query('UPDATE promotions SET used_count = used_count + 1 WHERE id = $1', [promo.id]);
  }

  res.status(201).json({
    order: rows[0],
    // Test checkout: no real payment is taken. Real provider confirmation is required
    // before an order can be marked paid.
    payment: {
      provider: commerce.paymentProvider || 'test',
      configured: !!commerce.paymentConfigured,
      status: 'unpaid',
    },
  });
});

router.get('/orders', requireAuth, async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ orders: rows });
});

router.get('/orders/:id', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  const order = rows[0];
  if (!order) return res.status(404).json({ error: 'سفارش پیدا نشد.' });
  if (req.user.role !== 'admin' && order.user_id !== req.user.id)
    return res.status(403).json({ error: 'شما اجازه مشاهده این سفارش را ندارید.' });
  res.json({ order });
});

export default router;
