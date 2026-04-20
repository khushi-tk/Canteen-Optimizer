/**
 * hooks/useOrder.ts
 *
 * Manages the checkout flow: fetches available time-slots, tracks
 * the selected slot, and orchestrates order placement.
 *
 * Returns slot data, selection helpers, order token, and submission state.
 */

import { useCallback, useEffect, useState } from 'react';
import type { CartItem, OrderToken, TimeSlot } from '../types';
import { fetchTimeSlots, placeOrder } from '../services/api';

interface UseOrderReturn {
  slots: TimeSlot[];
  slotsLoading: boolean;
  selectedSlotId: string | null;
  selectSlot: (id: string) => void;
  orderToken: OrderToken | null;
  isPlacingOrder: boolean;
  orderError: string | null;
  submitOrder: (cart: CartItem[], total: number, userId: string) => Promise<void>;
  resetOrder: () => void;
}

export function useOrder(): UseOrderReturn {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [orderToken, setOrderToken] = useState<OrderToken | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setSlotsLoading(true);
      try {
        const res = await fetchTimeSlots();
        if (!cancelled) {
          setSlots(res.data);
          // Auto-select first available slot
          const first = res.data.find((s) => s.available);
          if (first) setSelectedSlotId(first.id);
        }
      } catch {
        // Silently fail — slots will be empty
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  const selectSlot = useCallback((id: string) => {
    setSelectedSlotId(id);
  }, []);

  const submitOrder = useCallback(
    async (cart: CartItem[], total: number, userId: string) => {
      if (!selectedSlotId) return;
      setIsPlacingOrder(true);
      setOrderError(null);
      try {
        const res = await placeOrder({
          items: cart.map((ci) => ({
            menuItemId: ci.menuItem.id,
            quantity: ci.quantity,
          })),
          totalAmount: total,
          slotId: selectedSlotId,
          userId,
        });
        setOrderToken(res.data);
      } catch (err) {
        setOrderError(
          err instanceof Error ? err.message : 'Order placement failed',
        );
      } finally {
        setIsPlacingOrder(false);
      }
    },
    [selectedSlotId],
  );

  const resetOrder = useCallback(() => {
    setOrderToken(null);
    setOrderError(null);
    setSelectedSlotId(null);
  }, []);

  return {
    slots,
    slotsLoading,
    selectedSlotId,
    selectSlot,
    orderToken,
    isPlacingOrder,
    orderError,
    submitOrder,
    resetOrder,
  };
}
