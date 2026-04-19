/**
 * hooks/useMenu.ts
 *
 * Fetches the canteen menu on mount and manages the full shopping-cart
 * state internally — no React Context needed.
 *
 * Cart ops: addToCart, removeFromCart, updateQuantity, clearCart
 * Derived: cartCount, cartTotal (both via useMemo)
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CartItem, MenuItem } from '../types';
import { fetchMenu } from '../services/api';

interface UseMenuReturn {
  items: MenuItem[];
  isLoading: boolean;
  error: string | null;
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export function useMenu(): UseMenuReturn {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetchMenu();
        if (!cancelled) {
          setItems(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load menu');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci,
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) =>
          ci.menuItem.id === id
            ? { ...ci, quantity: ci.quantity + delta }
            : ci,
        )
        .filter((ci) => ci.quantity > 0);
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(
    () => cart.reduce((sum, ci) => sum + ci.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, ci) => sum + ci.menuItem.price * ci.quantity, 0),
    [cart],
  );

  return {
    items,
    isLoading,
    error,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };
}
