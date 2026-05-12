/**
 * src/hooks/useCart.ts
 */

import { useState, useCallback, useMemo } from 'react';
import type { CartItem, MenuItem } from '../types';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.menuItem.price, 0),
    [cart]
  );

  const addItem = useCallback((menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === menuItem.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItem.id === id
            ? { ...c, quantity: Math.max(0, c.quantity + delta) }
            : c
        )
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const checkout = useCallback(() => {
    // TODO: wire to your order API
    console.log('Checkout:', cart);
    setCart([]);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    cartCount,
    cartTotal,
    addItem,
    updateQty,
    checkout,
    clearCart,
  };
}