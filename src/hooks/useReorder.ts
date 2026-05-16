/**
 * hooks/useReorder.ts
 *
 * One-click reorder: takes a past OrderToken, validates its items
 * against the current menu, populates the cart, and navigates
 * directly to the checkout screen.
 */

import { useCallback } from 'react';
import type { MenuItem, OrderToken } from '../types';

export interface ReorderResult {
  added: number;
  unavailable: string[];
}

interface UseReorderOptions {
  menuItems: MenuItem[];
  clearCart: () => void;
  addItem: (item: MenuItem) => void;
  navigateToCheckout: () => void;
}

export function useReorder({
  menuItems,
  clearCart,
  addItem,
  navigateToCheckout,
}: UseReorderOptions) {
  const reorder = useCallback(
    (order: OrderToken): ReorderResult => {
      const unavailable: string[] = [];
      let added = 0;

      // Clear existing cart before reordering
      clearCart();

      for (const ci of order.items) {
        // Find current menu item by ID to check availability
        const currentMenuItem = menuItems.find(
          (m) => m.id === ci.menuItem.id,
        );

        if (!currentMenuItem || !currentMenuItem.available) {
          unavailable.push(ci.menuItem.name);
          continue;
        }

        // Add the item N times (quantity)
        for (let q = 0; q < ci.quantity; q++) {
          addItem(currentMenuItem);
        }
        added += ci.quantity;
      }

      // Only navigate to checkout if we successfully added items
      if (added > 0) {
        navigateToCheckout();
      }

      return { added, unavailable };
    },
    [menuItems, clearCart, addItem, navigateToCheckout],
  );

  return { reorder };
}
