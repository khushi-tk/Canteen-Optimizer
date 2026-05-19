/**
 * hooks/useAdminOrders.ts
 *
 * Admin order queue management with Supabase persistence and
 * real-time updates. Falls back to localStorage mock bridge
 * when Supabase is not configured.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Order, OrderStatus } from '../types';
import {
  fetchAllOrders,
  updateOrderStatus as updateOrderStatusInDB,
  subscribeToOrders,
} from '../services/orderService';

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  /* ── Load orders (Supabase or localStorage) ─────────────── */
  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchAllOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    }
  }, []);

  /* ── Initial fetch + real-time subscription ─────────────── */
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadOrders();
      setIsLoading(false);
    };
    void init();

    // Subscribe works for both Supabase Realtime and localStorage mock bridge
    unsubRef.current = subscribeToOrders(() => {
      void loadOrders();
    });

    return () => {
      unsubRef.current?.();
    };
  }, [loadOrders]);

  /* ── Refresh when tab regains focus ─────────────────────── */
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        void loadOrders();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [loadOrders]);

  /* ── Status update (persists to Supabase or localStorage) ─ */
  const updateStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
            : o,
        ),
      );
      try {
        await updateOrderStatusInDB(orderId, newStatus);
      } catch {
        // Revert on failure — re-fetch
        void loadOrders();
      }
    },
    [loadOrders],
  );

  const cancelOrder = useCallback(
    (orderId: string) => {
      void updateStatus(orderId, 'cancelled');
    },
    [updateStatus],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadOrders();
    setIsLoading(false);
  }, [loadOrders]);

  const stats = {
    active: orders.filter((o) => ['pending_payment', 'confirmed', 'preparing', 'ready'].includes(o.status)).length,
    pending: orders.filter((o) => o.status === 'pending_payment').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    completed: orders.filter((o) => o.status === 'picked_up').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    revenue: orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0),
  };

  return {
    orders,
    stats,
    isLoading,
    error,
    updateStatus,
    cancelOrder,
    refresh,
  };
}