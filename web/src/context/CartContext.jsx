import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'maison_fraise_cart_v1';

function lineKey(item) {
  return [item.productId, item.variantLabel || '', item.flavor || ''].join('::');
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((product, opts = {}) => {
    const variantLabel = opts.variantLabel || (product.variants?.[0]?.label ?? null);
    const variant = (product.variants || []).find((v) => v.label === variantLabel);
    const unitPriceCents = variant ? Number(variant.priceCents) : product.price_cents;
    const line = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image_url,
      variantLabel,
      flavor: opts.flavor || null,
      unitPriceCents,
      quantity: opts.quantity || 1,
      customization: opts.customization || null,
    };
    setItems((prev) => {
      const key = lineKey(line);
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === key ? { ...i, quantity: i.quantity + line.quantity } : i
        );
      }
      return [...prev, line];
    });
    setFlash((n) => n + 1);
  }, []);

  const remove = useCallback((item) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== lineKey(item)));
  }, []);

  const setQuantity = useCallback((item, quantity) => {
    setItems((prev) =>
      prev.map((i) => (lineKey(i) === lineKey(item) ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotalCents = items.reduce((n, i) => n + i.unitPriceCents * i.quantity, 0);

  const value = useMemo(
    () => ({ items, add, remove, setQuantity, clear, count, subtotalCents, flash }),
    [items, add, remove, setQuantity, clear, count, subtotalCents, flash]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
