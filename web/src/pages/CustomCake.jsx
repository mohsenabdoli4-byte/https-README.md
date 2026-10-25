import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cake, Check } from 'lucide-react';
import { api } from '../lib/api.js';
import { money } from '../lib/format.js';
import { useSite } from '../context/SiteContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { PHOTOS } from '../lib/images.js';

const BASE_PRICE = 4500; // 6" base cake
const SIZES = [
  { label: '۶ اینچ · برای ۸ نفر', surcharge: 0 },
  { label: '۸ اینچ · برای ۱۴ نفر', surcharge: 1800 },
  { label: '۱۰ اینچ · برای ۲۲ نفر', surcharge: 3600 },
];
const FLAVOURS = ['وانیل', 'شکلات تلخ', 'پسته', 'لیمو'];
const FILLINGS = ['مغزی تمشک', 'کارامل نمکی', 'کرم وانیل', 'گاناش شکلات'];
const FROSTINGS = ['خامه‌ای صورتی', 'خامه ماسکارپونه', 'شکلات تلخ', 'مرنگ کاراملی'];

export default function CustomCake() {
  const { symbol } = useSite();
  const { add } = useCart();
  const { success } = useToast();
  const navigate = useNavigate();

  const [config, setConfig] = useState({
    size: SIZES[0].label,
    flavour: FLAVOURS[0],
    filling: FILLINGS[0],
    frosting: FROSTINGS[0],
    servings: '8',
    message: '',
  });

  const size = SIZES.find((s) => s.label === config.size) || SIZES[0];
  const total = BASE_PRICE + size.surcharge;

  const summary = useMemo(
    () =>
      [
        config.size,
        config.flavour,
        config.filling,
        config.frosting,
        config.message && `«${config.message}»`,
      ].filter(Boolean),
    [config]
  );

  const addCustomCake = () => {
    add(
      {
        id: `custom-${Date.now()}`,
        slug: 'custom-cake',
        name: 'کیک جشن سفارشی',
        image_url: PHOTOS.cakes[3],
        price_cents: total,
        variants: [],
      },
      {
        variantLabel: config.size,
        flavor: config.flavour,
        quantity: 1,
        customization: {
          message: config.message,
          size: config.size,
          flavour: config.flavour,
          filling: config.filling,
          frosting: config.frosting,
          servings: config.servings,
        },
      }
    );
    success('کیک سفارشی شما به سبد خرید اضافه شد.');
    navigate('/cart');
  };

  const Field = ({ label, options, value, onChange, id }) => (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="container-x py-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="eyebrow">کیک‌ساز</p>
          <h1 className="h-display mt-3 text-4xl sm:text-5xl">کیک خود را طراحی کنید</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            اندازه، طعم و روکش را انتخاب کنید، پیام شخصی خود را اضافه کنید و ما آن را به سفارش شما می‌پزیم.
            کیک‌ها به ۴۸ ساعت زمان نیاز دارند؛ قیمت نهایی هنگام تسویه حساب تأیید می‌شود.
          </p>

          <div className="mt-8 space-y-5">
            <Field
              id="cake-size"
              label="اندازه"
              options={SIZES.map((s) => s.label)}
              value={config.size}
              onChange={(v) => setConfig((c) => ({ ...c, size: v }))}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="cake-flavour"
                label="طعم اسفنج"
                options={FLAVOURS}
                value={config.flavour}
                onChange={(v) => setConfig((c) => ({ ...c, flavour: v }))}
              />
              <Field
                id="cake-filling"
                label="مغزی"
                options={FILLINGS}
                value={config.filling}
                onChange={(v) => setConfig((c) => ({ ...c, filling: v }))}
              />
            </div>
            <Field
              id="cake-frosting"
              label="روکش"
              options={FROSTINGS}
              value={config.frosting}
              onChange={(v) => setConfig((c) => ({ ...c, frosting: v }))}
            />
            <div>
              <label htmlFor="cake-note" className="label">
                پیام شخصی‌سازی‌شده (اختیاری)
              </label>
              <input
                id="cake-note"
                value={config.message}
                onChange={(e) => setConfig((c) => ({ ...c, message: e.target.value.slice(0, 60) }))}
                placeholder="تولدت مبارک!"
                className="field"
              />
            </div>
            <div className="rounded-3xl bg-butter/60 p-5 text-sm text-cocoa/80">
              <p className="flex items-center gap-2 font-semibold text-cocoa">
                <Cake className="h-4 w-4 text-rose" /> هشدار آلرژن
              </p>
              <p className="mt-2">
                همه کیک‌ها حاوی گندم، تخم‌مرغ و لبنیات هستند و در آشپزخانه‌ای تهیه می‌شوند که با مغزها
                و کنجد سر و کار دارد. آلرژی‌ها را در توضیحات سفارش بنویسید تا امکان‌سنجی را تأیید کنیم.
              </p>
            </div>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card overflow-hidden">
            <img
              src={PHOTOS.cakes[3]}
              alt="کیک لایه‌ای جشن سفارشی"
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">کیک شما</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {summary.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-cocoa/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between border-t border-cocoa/10 pt-4">
                <span className="text-sm text-muted">مجموع برآوردی</span>
                <span className="font-display text-2xl font-semibold">{money(total, symbol)}</span>
              </div>
              <button onClick={addCustomCake} className="btn-dark mt-5 w-full">
                افزودن به سبد خرید
              </button>
              <p className="mt-3 text-center text-xs text-muted">
                گزینه‌های پولی مجموع را به‌روز می‌کنند. موجودی هنگام انتخاب تاریخ تأیید می‌شود.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
