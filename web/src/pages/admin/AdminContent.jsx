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
      success('محتوای صفحه اصلی ذخیره شد.');
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
          <h1 className="h-display text-3xl">محتوای وب‌سایت</h1>
          <p className="mt-1 text-sm text-muted">ویرایش متن صفحه اصلی، بنرها و متن پاورقی.</p>
        </div>
        <button type="submit" disabled={busy} className="btn-dark">
          {busy ? 'در حال ذخیره…' : 'ذخیره محتوا'}
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">بخش نخست (هیرو)</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="متن بالای عنوان" path={['hero', 'eyebrow']} />
            <Text label="تیتر" path={['hero', 'headline']} />
            <div className="sm:col-span-2">
              <Text label="متن پشتیبان" path={['hero', 'subtext']} area />
            </div>
            <Text label="برچسب دکمه اصلی" path={['hero', 'primaryCta', 'label']} />
            <Text label="پیوند دکمه اصلی" path={['hero', 'primaryCta', 'href']} />
            <Text label="برچسب دکمه دوم" path={['hero', 'secondaryCta', 'label']} />
            <Text label="پیوند دکمه دوم" path={['hero', 'secondaryCta', 'href']} />
            <div className="sm:col-span-2">
              <Text label="نشانی تصویر بخش نخست" path={['hero', 'image']} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">عنوان بخش‌ها</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="عنوان دسته‌بندی‌ها" path={['categoriesTitle']} />
            <Text label="عنوان پرفروش‌ها" path={['bestsellersTitle']} />
            <div className="sm:col-span-2">
              <Text label="زیرعنوان دسته‌بندی‌ها" path={['categoriesSubtitle']} area />
            </div>
            <div className="sm:col-span-2">
              <Text label="زیرعنوان پرفروش‌ها" path={['bestsellersSubtitle']} area />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">مجموعه فصلی</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="عنوان" path={['seasonal', 'title']} />
            <Text label="فعال از" path={['seasonal', 'activeFrom']} />
            <div className="sm:col-span-2">
              <Text label="زیرعنوان" path={['seasonal', 'subtitle']} area />
            </div>
            <Text label="فعال تا" path={['seasonal', 'activeTo']} />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">بنر کیک</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="تیتر" path={['cakeBanner', 'headline']} />
            <Text label="برچسب دکمه اصلی" path={['cakeBanner', 'primaryCta', 'label']} />
            <Text label="برچسب دکمه دوم" path={['cakeBanner', 'secondaryCta', 'label']} />
            <Text label="پیوند دکمه اصلی" path={['cakeBanner', 'primaryCta', 'href']} />
            <div className="sm:col-span-2">
              <Text label="متن" path={['cakeBanner', 'body']} area rows={3} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">داستان برند و خبرنامه</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="عنوان داستان" path={['story', 'title']} />
            <Text label="برچسب پیوند داستان" path={['story', 'link', 'label']} />
            <div className="sm:col-span-2">
              <Text label="متن داستان" path={['story', 'body']} area rows={4} />
            </div>
            <Text label="عنوان خبرنامه" path={['newsletter', 'title']} />
            <Text label="متن خبرنامه" path={['newsletter', 'body']} area />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">پاورقی</h2>
          <div className="mt-4">
            <Text label="توضیح برند" path={['footer', 'description']} area rows={3} />
          </div>
          <p className="mt-3 text-xs text-muted">
            ستون‌های پیوند پاورقی فعلاً از فایل تنظیمات مدیریت می‌شوند.
          </p>
        </section>
      </div>

      <button type="submit" disabled={busy} className="btn-dark mt-6">
        {busy ? 'در حال ذخیره…' : 'ذخیره محتوا'}
      </button>
    </form>
  );
}
