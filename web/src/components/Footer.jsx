import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Footer() {
  const { brand, contact, content } = useSite();
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/newsletter', { email });
      success(res.message || 'You are on the list.');
      setEmail('');
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const footer = content?.footer;
  const brandName = brand?.logoText || brand?.name || 'Maison Fraise';

  return (
    <footer className="mt-24 border-t border-cocoa/10 bg-white/60">
      <div className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-strawberry font-display text-lg font-bold text-cocoa">
                {brandName.charAt(0)}
              </span>
              <span className="font-display text-lg font-semibold text-cocoa">{brandName}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {footer?.description}
            </p>

            <form onSubmit={subscribe} className="mt-6 max-w-sm">
              <label htmlFor="footer-email" className="label">
                Join the newsletter
              </label>
              <div className="flex gap-2">
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="field"
                />
                <button type="submit" disabled={busy} className="btn-dark shrink-0">
                  {busy ? '…' : 'Join'}
                </button>
              </div>
            </form>

            {contact?.social?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {contact.social.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="chip bg-blush text-cocoa hover:bg-strawberry/60"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {(footer?.columns || []).map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-base font-semibold text-cocoa">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.href} className="text-sm text-muted hover:text-rose">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 border-t border-cocoa/10 pt-8 text-sm text-muted sm:grid-cols-3">
          <div>
            <h3 className="mb-2 font-semibold text-cocoa">Visit</h3>
            <p>{contact?.address}</p>
            <p>{contact?.phone}</p>
            <a href={`mailto:${contact?.email}`} className="hover:text-rose">
              {contact?.email}
            </a>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-cocoa">Opening hours</h3>
            {(contact?.hours || []).map((h) => (
              <p key={h.day}>
                <span className="text-cocoa/80">{h.day}:</span> {h.time}
              </p>
            ))}
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-cocoa">Good to know</h3>
            <p>Orders are baked to order. Cakes need 48 hours' notice.</p>
            <p className="mt-2">Allergen information is available on every product page.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-cocoa/10 pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <p>Demo store — payments run in test mode until a provider is connected.</p>
        </div>
      </div>
    </footer>
  );
}
