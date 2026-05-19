/**
 * hooks/useMenu.ts
 *
 * Loads menu from API (mock localStorage or real endpoint) and
 * keeps it in sync across tabs/admin dashboards via the storage event.
 */

import { useState, useEffect, useCallback } from 'react';
import type { MenuItem } from '../types';
import { fetchMenu, MENU_STORAGE_KEY, getDefaultMenu } from '../services/api';

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>(getDefaultMenu);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchMenu();
      setItems(res.data);
    } catch (err) {
      console.error('[useMenu] failed to load:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* initial load */
  useEffect(() => {
    void load();
  }, [load]);

  /* sync across tabs / admin updates (same pattern as useCrowdData) */
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === MENU_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as MenuItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          }
        } catch {
          /* ignore corrupt storage data */
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return { items, isLoading, reload: load };
}