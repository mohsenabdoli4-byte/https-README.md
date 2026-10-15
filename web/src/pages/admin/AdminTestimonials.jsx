import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import StarRating from '../../components/StarRating.jsx';

export default function AdminTestimonials() {
  const { success, error } = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', rating: 5, body: '' });
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/admin/testimonials').then((d) => setItems(d.testimonials || []));
  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/testimonials', form);
      success('Testimonial added.');
      setForm({ name: '', location: '', rating: 5, body: '' });
      load();
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (t) => {
    await api.patch(`/admin/testimonials/${t.id}`, { approved: !t.approved });
    load();
  };

  const remove = async (t) => {
    await api.del(`/admin/testimonials/${t.id}`);
    load();
  };

  return (
    <div>
      <h1 className="h-display text-3xl">Testimonials</h1>
      <p className="mt-1 text-sm text-muted">
        New stores show sample testimonials, clearly labelled, until real customer reviews arrive.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-cocoa">{t.name}</p>
                  <p className="text-xs text-muted">{t.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating value={t.rating} />
                  {t.is_sample && <span className="chip bg-butter/70 text-cocoa">Sample</span>}
                  <button onClick={() => toggle(t)} className={`chip ${t.approved ? 'bg-mint' : 'bg-muted/20 text-muted'}`}>
                    {t.approved ? 'Visible' : 'Hidden'}
                  </button>
                  <button onClick={() => remove(t)} aria-label={`Delete testimonial from ${t.name}`} className="text-muted hover:text-rose">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-cocoa/80">{t.body}</p>
            </div>
          ))}
          {items.length === 0 && <div className="card p-8 text-sm text-muted">No testimonials yet.</div>}
        </div>

        <form onSubmit={create} className="card h-fit p-6">
          <h2 className="font-display text-xl font-semibold">Add a testimonial</h2>
          <p className="mt-1 text-xs text-muted">Marked as a sample until real reviews replace it.</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="t-name">Name</label>
              <input id="t-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="t-loc">Location</label>
              <input id="t-loc" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="t-rating">Rating</label>
              <select id="t-rating" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="field">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="t-body">Testimonial</label>
              <textarea id="t-body" rows={4} required value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} className="field" />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-dark mt-5 w-full">
            <Plus className="h-4 w-4" /> Add testimonial
          </button>
        </form>
      </div>
    </div>
  );
}
