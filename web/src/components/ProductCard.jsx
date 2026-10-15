import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import StarRating from './StarRating.jsx';
import { money } from '../lib/format.js';
import { useCart } from '../context/CartContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../lib/api.js';
import { useState } from 'react';

export default function ProductCard({ product, compact = false }) {
  const { add } = useCart();
  const { symbol } = useSite();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const addToCart = (e) => {
    e.preventDefault();
    add(product, { quantity: 1 });
    success(`${product.name} added to your bag.`);
  };

  const wishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/signin');
      return;
    }
    try {
      await api.post('/wishlist', { productId: product.id });
      setSaved(true);
      success('Saved to your wishlist.');
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <article className="group card flex h-full flex-col overflow-hidden">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.slug}`} className="block">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className={`w-full object-cover transition duration-700 group-hover:scale-[1.04] ${
            compact ? 'h-40' : 'h-56'
          }`}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.is_bestseller && <span className="chip bg-cocoa text-cream">Bestseller</span>}
          {product.is_new && <span className="chip bg-mint text-cocoa">New</span>}
          {product.is_seasonal && <span className="chip bg-strawberry text-cocoa">Seasonal</span>}
          {!product.in_stock && <span className="chip bg-white text-muted">Sold out</span>}
        </div>
        </Link>
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={wishlist}
            aria-label={`Save ${product.name} to wishlist`}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-cocoa shadow-card hover:bg-white"
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-rose text-rose' : ''}`} />
          </button>
          <Link
            to={`/product/${product.slug}`}
            aria-label={`Quick view ${product.name}`}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-cocoa shadow-card hover:bg-white"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-snug text-cocoa">
            <Link to={`/product/${product.slug}`} className="hover:text-rose">
              {product.name}
            </Link>
          </h3>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{product.short_description}</p>

        <div className="mt-3">
          <StarRating value={product.rating} count={product.review_count} />
        </div>

        {product.flavors?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.flavors.slice(0, 3).map((f) => (
              <span key={f} className="chip bg-cream text-cocoa/70 ring-1 ring-cocoa/10">
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div>
            <p className="font-display text-xl font-semibold text-cocoa">
              {money(product.price_cents, symbol)}
            </p>
            {product.variants?.length > 1 && (
              <p className="text-xs text-muted">{product.variants.length} options</p>
            )}
          </div>
          <button
            onClick={addToCart}
            disabled={!product.in_stock}
            className="btn-rose !px-4 !py-2.5"
            aria-label={`Add ${product.name} to bag`}
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
