import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { api } from '../lib/api.js';
import { money } from '../lib/format.js';
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
    <PageShell eyebrow="هنر دست" title={content?.story?.title || 'داستان ما'}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <img src={PHOTOS.pastries[1]} alt="شیرینی‌هایی که با دست تکمیل می‌شوند" className="h-72 w-full rounded-4xl object-cover shadow-card" />
          <img src={PHOTOS.desserts[0]} alt="دسری که در آشپزخانه تزئین می‌شود" className="mt-10 h-72 w-full rounded-4xl object-cover shadow-card" />
        </div>
        <div className="space-y-5 text-base leading-relaxed text-muted">
          <p>{content?.story?.body}</p>
          <p>
            ما در دسته‌های کوچک کار می‌کنیم تا هیچ‌چیز بی‌استفاده نماند. ماکارون‌ها همان روزی که فروخته می‌شوند
            پر می‌شوند، کیک‌ها روزی که از آشپزخانه خارج می‌شوند مونتاژ می‌شوند و شیرینی‌ها در سه روز ورقه‌ای
            می‌شوند تا بافتی که می‌خواهیم به دست آید. میوه از بازار تهیه می‌شود و با فصل تغییر می‌کند.
          </p>
          <p>
            اگر چیزی درست نبود، به ما بگویید — ترجیح می‌دهیم آن را دوباره بسازیم تا اینکه آن را متوسط به یاد بیاورید.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/shop" className="btn-dark">خرید از منو</Link>
            <Link to="/contact" className="btn-ghost">بازدید از فروشگاه</Link>
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
      success(res.message || 'پیام ارسال شد.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      eyebrow="سلام کنید"
      title="تماس با ما"
      intro="درباره سفارش، کیک سفارشی یا حساسیت غذایی سؤالی دارید؟ پیامی بفرستید تا در اولین روز کاری پاسخ دهیم."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="card p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ct-name" className="label">نام</label>
              <input id="ct-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field" />
            </div>
            <div>
              <label htmlFor="ct-email" className="label">ایمیل</label>
              <input id="ct-email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="field ltr" />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="ct-subject" className="label">موضوع</label>
            <input id="ct-subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="field" />
          </div>
          <div className="mt-4">
            <label htmlFor="ct-message" className="label">پیام</label>
            <textarea id="ct-message" rows={5} required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="field" />
          </div>
          <button type="submit" disabled={busy} className="btn-dark mt-6">
            {busy ? 'در حال ارسال…' : 'ارسال پیام'}
          </button>
        </form>

        <aside className="card h-fit p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">بازدید حضوری</h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
              <span className="text-muted">{contact?.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
              <span className="text-muted ltr">{contact?.phone}</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
              <a href={`mailto:${contact?.email}`} className="text-muted ltr hover:text-rose">{contact?.email}</a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
              <span className="text-muted">
                {(contact?.hours || []).map((h) => (
                  <span key={h.day} className="block">{h.day}: <span className="ltr inline-block">{h.time}</span></span>
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
  { q: 'چقدر زودتر باید سفارش بدهم؟', a: 'بیشتر دسرها همان روز یا در چند ساعت آماده می‌شوند. کیک‌های جشن و سفارش‌های بزرگ سفارشی به ۴۸ ساعت زمان نیاز دارند.' },
  { q: 'ارسال دارید؟', a: 'بله — در محدوده مناطق محلی ما ارسال می‌کنیم. برای سفارش‌های بالای مبلغ مشخص‌شده در سبد خرید، ارسال رایگان است؛ در غیر این صورت هزینه ثابتی دریافت می‌شود. می‌توانید تحویل حضوری را هم انتخاب کنید.' },
  { q: 'می‌توانم پیام شخصی روی کیک اضافه کنم؟', a: 'بله. از کیک‌ساز یا فیلد پیام در هر محصول کیک قابل شخصی‌سازی استفاده کنید.' },
  { q: 'دسرها را چطور نگهداری کنم؟', a: 'همه را در یخچال نگه دارید و ۲۰ دقیقه پیش از سرو در دمای اتاق قرار دهید. ماکارون‌ها تا ۴۸ ساعت بهترین کیفیت را دارند.' },
  { q: 'برای آلرژی‌ها گزینه دارید؟', a: 'آلرژن‌ها در صفحه هر محصول فهرست شده‌اند. همه محصولات در آشپزخانه‌ای تهیه می‌شوند که با گندم، تخم‌مرغ، لبنیات، مغزها و کنجد سر و کار دارد، بنابراین محیطی کاملاً بدون آلرژن تضمین نمی‌کنیم.' },
  { q: 'می‌توانم سفارشم را تغییر دهم یا لغو کنم؟', a: 'هرچه سریع‌تر با ما تماس بگیرید. سفارش‌هایی که در حال آماده‌سازی یا ارسال هستند قابل تغییر نیستند.' },
];

export function Faq() {
  return (
    <PageShell eyebrow="راهنما" title="پرسش‌های متداول" intro="پاسخ‌های کوتاه. اگر پرسش شما اینجا نبود، پیامی برای ما بفرستید.">
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
    <PageShell eyebrow="قوانین" title="ارسال و تحویل" intro="سفارش شما چطور به دستتان می‌رسد و اگر برنامه‌ها تغییر کرد چه اتفاقی می‌افتد.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-7">
          <h2 className="font-display text-xl font-semibold">ارسال</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>ارسال محلی در {commerce?.deliveryZones?.join('، ') || 'مناطق محلی ما'}.</li>
            <li>هزینه ثابت {money(commerce?.deliveryFeeCents || 0, symbol)}، رایگان برای سفارش بالای {money(commerce?.freeDeliveryThresholdCents || 0, symbol)}.</li>
            <li>در تسویه حساب تاریخ و بازه دو ساعته را انتخاب کنید.</li>
            <li>ارسال‌ها با پیک‌های خودمان و در کیف‌های دمای کنترل‌شده انجام می‌شود.</li>
          </ul>
        </div>
        <div className="card p-7">
          <h2 className="font-display text-xl font-semibold">مرجوعی و لغو سفارش</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>چون خوراکی‌ها به سفارش شما ساخته می‌شوند، پس از تحویل امکان بازگشت کالا وجود ندارد.</li>
            <li>اگر مشکلی در سفارش شما هست، همان روز با ما تماس بگیرید تا آن را درست کنیم.</li>
            <li>سفارش‌ها پیش از شروع آماده‌سازی بدون هزینه قابل لغو هستند.</li>
            <li>لغو سفارش پس از شروع آماده‌سازی ممکن است قابل بازپرداخت نباشد.</li>
          </ul>
        </div>
        <div className="card p-7 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">تحویل حضوری</h2>
          <p className="mt-3 text-sm text-muted">
            {commerce?.pickupEnabled
              ? 'تحویل حضوری در ساعات کاری از باجه فروشگاه امکان‌پذیر است. شماره سفارش خود را همراه داشته باشید.'
              : 'تحویل حضوری در حال حاضر فعال نیست — فقط ارسال.'}
          </p>
        </div>
      </div>
    </PageShell>
  );
}

export function Privacy() {
  return (
    <PageShell eyebrow="حقوقی" title="سیاست حفظ حریم خصوصی" intro="آخرین به‌روزرسانی برای این فروشگاه نمایشی.">
      <div className="prose-sm max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
        <p>ما فقط اطلاعاتی را جمع می‌کنیم که برای آماده‌سازی و تحویل سفارش شما لازم است: نام، اطلاعات تماس، نشانی تحویل و تاریخچه سفارش‌ها.</p>
        <p>پرداخت توسط درگاه پرداخت ما انجام می‌شود. ما هرگز اطلاعات خام کارت را روی سرورهای خود دریافت یا ذخیره نمی‌کنیم.</p>
        <p>عضویت در خبرنامه فقط نشانی ایمیل شما را ذخیره می‌کند و هر زمان می‌توانید لغو عضویت کنید.</p>
        <p>ما داده‌های شخصی شما را نمی‌فروشیم. داده‌ها تا زمانی که برای سرویس‌دهی به حساب شما و رعایت الزامات قانونی لازم باشد نگهداری می‌شوند.</p>
        <p>برای درخواست دسترسی به داده‌های خود یا حذف آن‌ها، از اطلاعات صفحه تماس با ما استفاده کنید.</p>
      </div>
    </PageShell>
  );
}

export function Terms() {
  return (
    <PageShell eyebrow="حقوقی" title="قوانین و مقررات" intro="توافق میان شما و این فروشگاه.">
      <div className="prose-sm max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
        <p>با ثبت سفارش تأیید می‌کنید که اطلاعات ارائه‌شده شما درست است و توانایی بستن قرارداد را دارید.</p>
        <p>همه قیمت‌ها به واحد پول فروشگاه نمایش داده می‌شوند و در صورت ذکر، شامل مالیات مربوطه هستند. قیمت‌ها و موجودی ممکن است بدون اطلاع قبلی تغییر کنند.</p>
        <p>تصاویر محصولات جنبه نمایشی دارند؛ دسرهای دست‌ساز ممکن است ظاهری کمی متفاوت داشته باشند.</p>
        <p>سفارش‌ها پس از پذیرش توسط تیم ما تأیید می‌شوند. این فروشگاه نمایشی سفارش‌ها را در حالت آزمایشی پردازش می‌کند و پرداخت واقعی دریافت نمی‌کند.</p>
        <p>این قوانین فقط برای اهداف نمایشی ارائه شده‌اند و مشاوره حقوقی نیستند.</p>
      </div>
    </PageShell>
  );
}

export function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="font-hand text-3xl text-rose">اوه!</p>
      <h1 className="h-display mt-2 text-4xl">این صفحه در منو نیست</h1>
      <p className="mt-3 text-sm text-muted">
        صفحه‌ای که به دنبال آن بودید پیدا نشد.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Link to="/" className="btn-dark">بازگشت به خانه</Link>
        <Link to="/shop" className="btn-ghost">خرید همه دسرها</Link>
      </div>
    </div>
  );
}
