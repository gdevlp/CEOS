import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'ceo-dollar-bag';

const CartContext = createContext(null);

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, { size = '', color = '', image = '', quantity = 1, source = '' } = {}) => {
    const key = `${product.id}__${color}__${size}`;
    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity, source: source || item.source }
            : item
        );
      }
      return [
        ...prev,
        {
          key,
          product_id: product.id,
          brand_id: product.brand_id,
          brand_name: product.brand_name,
          brand_owner_id: product.brand_owner_id,
          title: product.title,
          price: product.price || 0,
          image: image || product.images?.[0] || '',
          size,
          color,
          quantity,
          source: source || 'direct',
        },
      ];
    });
  };

  const setQuantity = (key, quantity) => {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((item) => item.key !== key)
        : prev.map((item) => (item.key === key ? { ...item, quantity } : item))
    );
  };

  const remove = (key) => setItems((prev) => prev.filter((item) => item.key !== key));

  const clear = () => setItems([]);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items, add, setQuantity, remove, clear, count };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}