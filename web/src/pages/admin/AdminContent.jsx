import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useSite } from '../../context/SiteContext.jsx';

export default function AdminContent() {
  const { reload } = useSite();
  const { success, error } = useToast();
  const [content, setContent] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then((d) => setContent(d.settings.content));
  }, []);

  const setIn = (path, value) => {
    setContent((c) => {
      const next = structuredClone(c);
      let node = next;
      for (let i = 0; i < path.length - 1; i += 1) node = node[path[i]];
      node[path[path.length - 1]] = value;
      return next;
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/admin/settings/content', content);
      await reload();
      success('Homepage content saved.');
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!content) return <div className="card h-64 animate-pulse bg-blush/40" />;

  const Text = ({ label, path, area = false, rows = 2 }) => (
    <div>
      <label className="label" htmlFor={`f-${path.join('-')}`}>{label}</label>
      {area ? (
        <textarea
          id={`f-${path.join('-')}`}
          rows={rows}
          value={path.reduce((n, k) => n?.[k], content) ?? ''}
          onChange={(e) => setIn(path, e.target.value)}
          className="field"
        />
      ) : (
        <input
          id={`f-${path.join('-')}`}
          value={path.reduce((n, k) => n?.[k], content) ?? ''}
          onChange={(e) => setIn(path, e.target.value)}
          className="field"
        />
      )}
    </div>
  );

  return (
    <form onSubmit={save}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl">Website content</h1>
          <p className="mt-1 text-sm text-muted">Edit the homepage copy, banners and footer text.</p>
        </div>
        <button type="submit" disabled={busy} className="btn-dark">
          {busy ? 'Saving…' : 'Save content'}
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">Hero</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="Eyebrow" path={['hero', 'eyebrow']} />
            <Text label="Headline" path={['hero', 'headline']} />
            <div className="sm:col-span-2">
              <Text label="Supporting text" path={['hero', 'subtext']} area />
            </div>
            <Text label="Primary button label" path={['hero', 'primaryCta', 'label']} />
            <Text label="Primary button link" path={['hero', 'primaryCta', 'href']} />
            <Text label="Secondary button label" path={['hero', 'secondaryCta', 'label']} />
            <Text label="Secondary button link" path={['hero', 'secondaryCta', 'href']} />
            <div className="sm:col-span-2">
              <Text label="Hero image URL" path={['hero', 'image']} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">Section headings</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="Categories title" path={['categoriesTitle']} />
            <Text label="Bestsellers title" path={['bestsellersTitle']} />
            <div className="sm:col-span-2">
              <Text label="Categories subtitle" path={['categoriesSubtitle']} area />
            </div>
            <div className="sm:col-span-2">
              <Text label="Bestsellers subtitle" path={['bestsellersSubtitle']} area />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">Seasonal collection</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="Title" path={['seasonal', 'title']} />
            <Text label="Active from" path={['seasonal', 'activeFrom']} />
            <div className="sm:col-span-2">
              <Text label="Subtitle" path={['seasonal', 'subtitle']} area />
            </div>
            <Text label="Active to" path={['seasonal', 'activeTo']} />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">Cake banner</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="Headline" path={['cakeBanner', 'headline']} />
            <Text label="Primary button label" path={['cakeBanner', 'primaryCta', 'label']} />
            <Text label="Secondary button label" path={['cakeBanner', 'secondaryCta', 'label']} />
            <Text label="Primary button link" path={['cakeBanner', 'primaryCta', 'href']} />
            <div className="sm:col-span-2">
              <Text label="Body" path={['cakeBanner', 'body']} area rows={3} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">Brand story & newsletter</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="Story title" path={['story', 'title']} />
            <Text label="Story link label" path={['story', 'link', 'label']} />
            <div className="sm:col-span-2">
              <Text label="Story body" path={['story', 'body']} area rows={4} />
            </div>
            <Text label="Newsletter title" path={['newsletter', 'title']} />
            <Text label="Newsletter body" path={['newsletter', 'body']} area />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">Footer</h2>
          <div className="mt-4">
            <Text label="Brand description" path={['footer', 'description']} area rows={3} />
          </div>
          <p className="mt-3 text-xs text-muted">
            Footer link columns are managed in the settings file for now.
          </p>
        </section>
      </div>

      <button type="submit" disabled={busy} className="btn-dark mt-6">
        {busy ? 'Saving…' : 'Save content'}
      </button>
    </form>
  );
}
