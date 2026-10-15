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
  { label: '6" · serves 8', surcharge: 0 },
  { label: '8" · serves 14', surcharge: 1800 },
  { label: '10" · serves 22', surcharge: 3600 },
];
const FLAVOURS = ['Vanilla Bean', 'Dark Chocolate', 'Pistachio', 'Lemon'];
const FILLINGS = ['Raspberry compote', 'Salted caramel', 'Vanilla cream', 'Chocolate ganache'];
const FROSTINGS = ['Blush buttercream', 'Mascarpone cream', 'Dark chocolate', 'Torched meringue'];

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
        config.message && `“${config.message}”`,
      ].filter(Boolean),
    [config]
  );

  const addCustomCake = () => {
    add(
      {
        id: `custom-${Date.now()}`,
        slug: 'custom-cake',
        name: 'Custom Celebration Cake',
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
    success('Your custom cake has been added to the bag.');
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
          <p className="eyebrow">Cake builder</p>
          <h1 className="h-display mt-3 text-4xl sm:text-5xl">Design your cake</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            Choose the size, flavour and finish, add a personal message, and we will bake it to order.
            Cakes need 48 hours' notice; final pricing is confirmed at checkout.
          </p>

          <div className="mt-8 space-y-5">
            <Field
              id="cake-size"
              label="Size"
              options={SIZES.map((s) => s.label)}
              value={config.size}
              onChange={(v) => setConfig((c) => ({ ...c, size: v }))}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="cake-flavour"
                label="Sponge flavour"
                options={FLAVOURS}
                value={config.flavour}
                onChange={(v) => setConfig((c) => ({ ...c, flavour: v }))}
              />
              <Field
                id="cake-filling"
                label="Filling"
                options={FILLINGS}
                value={config.filling}
                onChange={(v) => setConfig((c) => ({ ...c, filling: v }))}
              />
            </div>
            <Field
              id="cake-frosting"
              label="Frosting"
              options={FROSTINGS}
              value={config.frosting}
              onChange={(v) => setConfig((c) => ({ ...c, frosting: v }))}
            />
            <div>
              <label htmlFor="cake-note" className="label">
                Personalised message (optional)
              </label>
              <input
                id="cake-note"
                value={config.message}
                onChange={(e) => setConfig((c) => ({ ...c, message: e.target.value.slice(0, 60) }))}
                placeholder="Happy birthday, Elodie!"
                className="field"
              />
            </div>
            <div className="rounded-3xl bg-butter/60 p-5 text-sm text-cocoa/80">
              <p className="flex items-center gap-2 font-semibold text-cocoa">
                <Cake className="h-4 w-4 text-rose" /> Allergen notice
              </p>
              <p className="mt-2">
                All cakes contain wheat, egg and dairy, and are prepared in a kitchen that handles nuts
                and sesame. Tell us about allergies in the order notes and we will confirm what is possible.
              </p>
            </div>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card overflow-hidden">
            <img
              src={PHOTOS.cakes[3]}
              alt="A custom layered celebration cake"
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">Your cake</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {summary.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-cocoa/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between border-t border-cocoa/10 pt-4">
                <span className="text-sm text-muted">Estimated total</span>
                <span className="font-display text-2xl font-semibold">{money(total, symbol)}</span>
              </div>
              <button onClick={addCustomCake} className="btn-dark mt-5 w-full">
                Add to bag
              </button>
              <p className="mt-3 text-center text-xs text-muted">
                Paid options update the total. Availability is confirmed when you choose a date.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
