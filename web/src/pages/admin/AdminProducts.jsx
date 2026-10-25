import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Archive, RotateCcw, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { money, faNum } from '../../lib/format.js';
import { useSite } from '../../context/SiteContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const EMPTY = {
  name: '',
  price: '',
  categoryId: '',
  imageUrl: '',
  shortDescription: '',
  description: '',
  prepTime: '',
  flavors: '',
  variants: '',
  ingredients: '',
  allergens: '',
  storage: '',
  isFeatured: false,
  isBestseller: false,
  isSeasonal: false,
  isNew: false,
  inStock: true,
  isCustomizable: false,
};

function toForm(p) {
  return {
    name: p.name || '',
    price: (p.price_cents / 100).toFixed(2),
    categoryId: p.category_id ? String(p.category_id) : '',
    imageUrl: p.image_url || '',
    shortDescription: p.short_description || '',
    description: p.description || '',
    prepTime: p.prep_time || '',
    flavors: (p.flavors || []).join('، '),
    variants: (p.variants || []).map((v) => `${v.label}|${(v.priceCents / 100).toFixed(2)}`).join('\n'),
    ingredients: p.ingredients || '',
    allergens: p.allergens || '',
    storage: p.storage || '',
    isFeatured: p.is_featured,
    isBestseller: p.is_bestseller,
    isSeasonal: p.is_seasonal,
    isNew: p.is_new,
    inStock: p.in_stock,
    isCustomizable: p.is_customizable,
  };
}

export default function AdminProducts() {
  const { symbol } = useSite();
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => api.get('/admin/products').then((d) => setProducts(d.products || []));

  useEffect(() => {
    load();
    api.get('/categories').then((d) => setCategories(d.categories || []));
  }, []);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const openNew = () => {
    setEditing('new');
    setForm(EMPTY);
  };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm(toForm(p));
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      priceCents: Math.round(Number(form.price) * 100),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      imageUrl: form.imageUrl,
      shortDescription: form.shortDescription,
      description: form.description,
      prepTime: form.prepTime,
      flavors: form.flavors.split(/[،,]/).map((s) => s.trim()).filter(Boolean),
      variants: form.variants
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, price] = line.split('|');
          return { label: (label || '').trim(), priceCents: Math.round(Number(price || 0) * 100) };
        }),
      ingredients: form.ingredients,
      allergens: form.allergens,
      storage: form.storage,
      isFeatured: form.isFeatured,
      isBestseller: form.isBestseller,
      isSeasonal: form.isSeasonal,
      isNew: form.isNew,
      inStock: form.inStock,
      isCustomizable: form.isCustomizable,
    };
    try {
      if (editing === 'new') await api.post('/admin/products', payload);
      else await api.put(`/admin/products/${editing}`, payload);
      success('محصول ذخیره شد.');
      setEditing(null);
      load();
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleArchive = async (p) => {
    await api.put(`/admin/products/${p.id}`, { archived: !p.archived });
    load();
  };

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl">محصولات</h1>
          <p className="mt-1 text-sm text-muted">{faNum(products.length)} محصول در فهرست.</p>
        </div>
        <button onClick={openNew} className="btn-dark">
          <Plus className="h-4 w-4" /> محصول جدید
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="جستجوی محصولات…"
        className="field mt-5 max-w-sm"
      />

      <div className="mt-5 card overflow-x-auto p-2">
        <table className="w-full text-start text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="p-3 text-start">محصول</th>
              <th className="p-3 text-start">دسته‌بندی</th>
              <th className="p-3 text-start">قیمت</th>
              <th className="p-3 text-start">برچسب‌ها</th>
              <th className="p-3 text-end">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa/10">
            {filtered.map((p) => (
              <tr key={p.id} className={p.archived ? 'opacity-50' : ''}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image_url} alt="" className="h-10 w-10 rounded-xl object-cover" />
                    <div>
                      <p className="font-medium text-cocoa">{p.name}</p>
                      <p className="text-xs text-muted ltr text-start">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted">{p.category_name || '—'}</td>
                <td className="p-3 font-semibold">{money(p.price_cents, symbol)}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {p.is_featured && <span className="chip bg-lavender">ویژه</span>}
                    {p.is_bestseller && <span className="chip bg-cocoa text-cream">پرفروش</span>}
                    {p.is_seasonal && <span className="chip bg-strawberry">فصلی</span>}
                    {!p.in_stock && <span className="chip bg-muted/20 text-muted">ناموجود</span>}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(p)} aria-label={`ویرایش ${p.name}`} className="grid h-8 w-8 place-items-center rounded-full hover:bg-blush/60">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleArchive(p)}
                      aria-label={p.archived ? `بازگردانی ${p.name}` : `بایگانی ${p.name}`}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-blush/60"
                    >
                      {p.archived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-cocoa/40 p-0 sm:p-4">
          <div className="h-full w-full max-w-2xl overflow-y-auto rounded-none bg-cream p-6 shadow-soft sm:rounded-4xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">
                {editing === 'new' ? 'محصول جدید' : 'ویرایش محصول'}
              </h2>
              <button onClick={() => setEditing(null)} aria-label="بستن ویرایشگر">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={save} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="ap-name">نام</label>
                <input id="ap-name" required value={form.name} onChange={set('name')} className="field" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="ap-price">قیمت ({symbol})</label>
                  <input id="ap-price" required type="number" step="0.01" value={form.price} onChange={set('price')} className="field ltr" />
                </div>
                <div>
                  <label className="label" htmlFor="ap-cat">دسته‌بندی</label>
                  <select id="ap-cat" value={form.categoryId} onChange={set('categoryId')} className="field">
                    <option value="">هیچ‌کدام</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="ap-image">نشانی تصویر</label>
                <input id="ap-image" value={form.imageUrl} onChange={set('imageUrl')} className="field ltr" />
              </div>
              <div>
                <label className="label" htmlFor="ap-short">توضیح کوتاه</label>
                <input id="ap-short" value={form.shortDescription} onChange={set('shortDescription')} className="field" />
              </div>
              <div>
                <label className="label" htmlFor="ap-desc">توضیح کامل</label>
                <textarea id="ap-desc" rows={3} value={form.description} onChange={set('description')} className="field" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="ap-prep">زمان آماده‌سازی</label>
                  <input id="ap-prep" value={form.prepTime} onChange={set('prepTime')} className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="ap-flavors">طعم‌ها (با کاما جدا شوند)</label>
                  <input id="ap-flavors" value={form.flavors} onChange={set('flavors')} className="field" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="ap-variants">گونه‌ها — هر خط یکی، برچسب|قیمت</label>
                <textarea id="ap-variants" rows={3} value={form.variants} onChange={set('variants')} className="field ltr font-mono text-xs" placeholder={'جعبه ۶ عددی|18.00\nجعبه ۱۲ عددی|33.00'} />
              </div>
              <div>
                <label className="label" htmlFor="ap-ing">مواد اولیه</label>
                <textarea id="ap-ing" rows={2} value={form.ingredients} onChange={set('ingredients')} className="field" />
              </div>
              <div>
                <label className="label" htmlFor="ap-allerg">آلرژن‌ها</label>
                <textarea id="ap-allerg" rows={2} value={form.allergens} onChange={set('allergens')} className="field" />
              </div>
              <div>
                <label className="label" htmlFor="ap-storage">نگهداری</label>
                <input id="ap-storage" value={form.storage} onChange={set('storage')} className="field" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ['isFeatured', 'ویژه'],
                  ['isBestseller', 'پرفروش'],
                  ['isSeasonal', 'فصلی'],
                  ['isNew', 'جدید'],
                  ['inStock', 'موجود'],
                  ['isCustomizable', 'قابل شخصی‌سازی'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm ring-1 ring-cocoa/10">
                    <input type="checkbox" checked={form[key]} onChange={set(key)} className="h-4 w-4 accent-rose" />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={busy} className="btn-dark">
                  {busy ? 'در حال ذخیره…' : 'ذخیره محصول'}
                </button>
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
