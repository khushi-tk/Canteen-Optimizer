/**
 * hooks/useInventory.ts
 *
 * Admin-write inventory state. Mirrors the useCrowdData pattern:
 * - Admin writes stock levels to localStorage
 * - Students reading MenuGrid will see items toggled unavailable
 *   when stock hits 0 (MenuGrid already handles available=false)
 * - Cross-tab propagation via the 'storage' event
 */

import { useState, useCallback, useEffect } from 'react';

export const INVENTORY_STORAGE_KEY = 'canteen_inventory_data';

export interface InventoryItem {
  menuItemId: string;
  menuItemName: string;
  emoji: string;
  category: string;
  stock: number;         // current units in stock
  lowStockThreshold: number;
  lastUpdatedAt: string;
}

export type StockStatus = 'ok' | 'low' | 'out';

export function getStockStatus(item: InventoryItem): StockStatus {
  if (item.stock === 0) return 'out';
  if (item.stock <= item.lowStockThreshold) return 'low';
  return 'ok';
}

function loadFromStorage(): InventoryItem[] | null {
  const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InventoryItem[];
  } catch {
    return null;
  }
}

function saveToStorage(items: InventoryItem[]): void {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  // Notify other tabs (and student views)
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: INVENTORY_STORAGE_KEY,
      newValue: JSON.stringify(items),
    }),
  );
}

export function useInventory(defaultItems?: InventoryItem[]) {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    return loadFromStorage() ?? defaultItems ?? [];
  });

  // Listen for cross-tab updates
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === INVENTORY_STORAGE_KEY && e.newValue) {
        try {
          setItems(JSON.parse(e.newValue) as InventoryItem[]);
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Seed defaults if nothing stored yet
  useEffect(() => {
    if (!loadFromStorage() && defaultItems && defaultItems.length > 0) {
      saveToStorage(defaultItems);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStock = useCallback((menuItemId: string, newStock: number) => {
    setItems((prev) => {
      const next = prev.map((it) =>
        it.menuItemId === menuItemId
          ? { ...it, stock: Math.max(0, newStock), lastUpdatedAt: new Date().toISOString() }
          : it,
      );
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateThreshold = useCallback((menuItemId: string, threshold: number) => {
    setItems((prev) => {
      const next = prev.map((it) =>
        it.menuItemId === menuItemId
          ? { ...it, lowStockThreshold: Math.max(0, threshold), lastUpdatedAt: new Date().toISOString() }
          : it,
      );
      saveToStorage(next);
      return next;
    });
  }, []);

  const resetAll = useCallback((defaults: InventoryItem[]) => {
    saveToStorage(defaults);
    setItems(defaults);
  }, []);

  const stats = {
    total: items.length,
    out: items.filter((i) => i.stock === 0).length,
    low: items.filter((i) => i.stock > 0 && i.stock <= i.lowStockThreshold).length,
    ok: items.filter((i) => i.stock > i.lowStockThreshold).length,
  };

  return { items, updateStock, updateThreshold, resetAll, stats };
}