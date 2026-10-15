import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { api } from '../lib/api.js';
import { useSite } from '../context/SiteContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { PHOTOS } from '../lib/images.js';

function PageShell({ eyebrow, title, intro, children }) {
  return (
    <div className="container-x py-12">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="h-display mt-2 max-w-3xl text-4xl sm:text-5xl">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{intro}</p>}
      <div className="mt-10">{children}</div>
    </div>
  );
}

export function OurStory() {
  const { content } = useSite();
  return (
    <PageShell eyebrow="Craft" title={content?.story?.title || 'Our Story'}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <img src={PHOTOS.pastries[1]} alt="Pastries being finished by hand" className="h-72 w-full rounded-4xl object-cover shadow-card" />
          <img src={PHOTOS.desserts[0]} alt="A dessert plated in the kitchen" className="mt-10 h-72 w-full rounded-4xl object-cover shadow-card" />
        </div>
        <div className="space-y-5 text-base leading-relaxed text-muted">
          <p>{content?.story?.body}</p>
          <p>
            We work in small batches so nothing sits. Macarons are filled the morning they are sold, cakes are
            assembled the day they leave the kitchen, and pastries are laminated over three days for the crumb we
            want. Fruit comes from the market and changes with the season.
          </p>
          <p>
            If something is not right, tell us — we would rather remake it than have you remember it as average.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/shop" className="btn-dark">Shop the menu</Link>
            <Link to="/contact" className="btn-ghost">Visit the store</Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export function Contact() {
  const { contact } = useSite();
  const { success, error } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/contact', form);
      success(res.message || 'Message sent.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      eyebrow="Say hello"
      title="Contact us"
      intro="Questions about an order, a custom cake or an allergy? Send a note and we will reply within one working day."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="card p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ct-name" className="label">Name</label>
              <input id="ct-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field" />
            </div>
            <div>
              <label htmlFor="ct-email" className="label">Email</label>
              <input id="ct-email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="field" />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="ct-subject" className="label">Subject</label>
            <input id="ct-subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="field" />
          </div>
          <div className="mt-4">
            <label htmlFor="ct-message" className="label">Message</label>
            <textarea id="ct-message" rows={5} required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="field" />
          </div>
          <button type="submit" disabled={busy} className="btn-dark mt-6">
            {busy ? 'Sending…' : 'Send message'}
          </button>
        </form>

        <aside className="card h-fit p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Visit us</h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
              <span className="text-muted">{contact?.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
              <span className="text-muted">{contact?.phone}</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
              <a href={`mailto:${contact?.email}`} className="text-muted hover:text-rose">{contact?.email}</a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
              <span className="text-muted">
                {(contact?.hours || []).map((h) => (
                  <span key={h.day} className="block">{h.day}: {h.time}</span>
                ))}
              </span>
            </li>
          </ul>
        </aside>
      </div>
    </PageShell>
  );
}

const FAQS = [
  { q: 'How far in advance should I order?', a: 'Most desserts are ready the same day or within a few hours. Celebration cakes and large custom orders need 48 hours notice.' },
  { q: 'Do you deliver?', a: 'Yes — we deliver within our local zones. Delivery is free over the threshold shown in the cart, otherwise a flat fee applies. You can also choose pickup in store.' },
  { q: 'Can I add a personal message to a cake?', a: 'Yes. Use the cake builder or the message field on any customisable cake product.' },
  { q: 'How should I store my desserts?', a: 'Keep everything refrigerated and bring to room temperature for 20 minutes before serving. Macarons are best within 48 hours.' },
  { q: 'Do you cater for allergies?', a: 'Every product page lists allergens. We prepare everything in a kitchen that handles wheat, egg, dairy, nuts and sesame, so we cannot guarantee an allergen-free environment.' },
  { q: 'Can I change or cancel an order?', a: 'Contact us as soon as possible. Orders already in preparation or dispatched cannot be changed.' },
];

export function Faq() {
  return (
    <PageShell eyebrow="Help" title="Frequently asked questions" intro="The quick answers. If yours is not here, send us a note.">
      <div className="grid gap-4 lg:grid-cols-2">
        {FAQS.map((f) => (
          <details key={f.q} className="card p-6">
            <summary className="cursor-pointer font-display text-lg font-semibold text-cocoa">{f.q}</summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}

export function Shipping() {
  const { commerce, symbol } = useSite();
  return (
    <PageShell eyebrow="Policies" title="Shipping & delivery" intro="How your order reaches you, and what happens if plans change.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-7">
          <h2 className="font-display text-xl font-semibold">Delivery</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>Local delivery within {commerce?.deliveryZones?.join(', ') || 'our local zones'}.</li>
            <li>Flat fee of {symbol}{((commerce?.deliveryFeeCents || 0) / 100).toFixed(2)}, free over {symbol}{((commerce?.freeDeliveryThresholdCents || 0) / 100).toFixed(2)}.</li>
            <li>Choose a date and a two-hour time slot at checkout.</li>
            <li>Deliveries are made by our own couriers in temperature-controlled bags.</li>
          </ul>
        </div>
        <div className="card p-7">
          <h2 className="font-display text-xl font-semibold">Returns & cancellation</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>Because our food is made to order, we cannot accept returns once delivered.</li>
            <li>If something is wrong with your order, contact us the same day and we will make it right.</li>
            <li>Orders can be cancelled free of charge before preparation begins.</li>
            <li>Cancellations after preparation starts may not be refundable.</li>
          </ul>
        </div>
        <div className="card p-7 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">Pickup</h2>
          <p className="mt-3 text-sm text-muted">
            {commerce?.pickupEnabled
              ? 'Pickup is available from the counter during opening hours. Bring your order number.'
              : 'Pickup is currently unavailable — delivery only.'}
          </p>
        </div>
      </div>
    </PageShell>
  );
}

export function Privacy() {
  return (
    <PageShell eyebrow="Legal" title="Privacy policy" intro="Last updated for this demo store.">
      <div className="prose-sm max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
        <p>We collect only what we need to prepare and deliver your order: your name, contact details, delivery address and order history.</p>
        <p>Payment is handled by our payment provider. We never collect or store raw card details on our servers.</p>
        <p>Newsletter subscriptions store your email address only, and you can unsubscribe at any time.</p>
        <p>We do not sell your personal data. Data is retained for as long as needed to service your account and meet legal obligations.</p>
        <p>To request access to, or deletion of, your data, contact us using the details on the contact page.</p>
      </div>
    </PageShell>
  );
}

export function Terms() {
  return (
    <PageShell eyebrow="Legal" title="Terms & conditions" intro="The agreement between you and this store.">
      <div className="prose-sm max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
        <p>By placing an order you confirm that the information you provide is accurate and that you are able to enter into a contract.</p>
        <p>All prices are shown in {`the store currency`} and include applicable taxes where noted. Prices and availability may change without notice.</p>
        <p>Product photography is representative; handmade desserts may vary slightly in appearance.</p>
        <p>Orders are confirmed once accepted by our team. This demo store processes orders in test mode and does not take real payments.</p>
        <p>These terms are provided for demonstration purposes and are not legal advice.</p>
      </div>
    </PageShell>
  );
}

export function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="font-hand text-3xl text-rose">oops</p>
      <h1 className="h-display mt-2 text-4xl">This page is not on the menu</h1>
      <p className="mt-3 text-sm text-muted">
        The page you were looking for could not be found.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Link to="/" className="btn-dark">Back home</Link>
        <Link to="/shop" className="btn-ghost">Shop all desserts</Link>
      </div>
    </div>
  );
}
