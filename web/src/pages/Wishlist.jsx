import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { api } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Wishlist() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/signin', { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    api
      .get('/wishlist')
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="container-x py-10">
      <p className="eyebrow">Saved for later</p>
      <h1 className="h-display mt-2 text-4xl sm:text-5xl">Your wishlist</h1>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-80 animate-pulse bg-blush/40" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush">
              <Heart className="h-6 w-6 text-cocoa" />
            </span>
            <h2 className="font-display mt-5 text-2xl font-semibold">Nothing saved yet</h2>
            <p className="mt-2 text-sm text-muted">
              Tap the heart on any dessert to keep it here.
            </p>
            <Link to="/shop" className="btn-dark mt-6">Browse the menu</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
