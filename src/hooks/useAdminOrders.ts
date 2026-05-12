/**
 * hooks/useAdminOrders.ts
 *
 * Admin order queue management with status transitions.
 */

import { useState, useCallback } from 'react';
import type { Order, OrderStatus } from '../types';

// Mock initial orders
const MOCK_ORDERS: Order[] = [
  {
    id: 'ord_001',
    studentName: 'Rahul Sharma',
    studentEmail: 'rahul@college.edu',
    items: [
      { menuItem: { id: 'm1', name: 'Veg Biryani', price: 120, emoji: '🍛', dietaryTag: 'veg', category: 'Rice', description: 'Fragrant basmati rice', prepTimeMinutes: 15, available: true }, quantity: 2, subtotal: 240 },
    ],
    total: 240,
    status: 'preparing',
    timeSlot: '12:30 - 12:45',
    pickupTime: '12:30',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'ord_002',
    studentName: 'Priya Patel',
    studentEmail: 'priya@college.edu',
    items: [
      { menuItem: { id: 'm2', name: 'Chicken Roll', price: 90, emoji: '🌯', dietaryTag: 'non-veg', category: 'Snacks', description: 'Grilled chicken wrap', prepTimeMinutes: 8, available: true }, quantity: 1, subtotal: 90 },
      { menuItem: { id: 'm3', name: 'Cold Coffee', price: 60, emoji: '☕', dietaryTag: 'veg', category: 'Beverages', description: 'Iced coffee with cream', prepTimeMinutes: 3, available: true }, quantity: 1, subtotal: 60 },
    ],
    total: 150,
    status: 'pending',
    timeSlot: '12:45 - 13:00',
    pickupTime: '12:45',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'ord_003',
    studentName: 'Arun Kumar',
    studentEmail: 'arun@college.edu',
    items: [
      { menuItem: { id: 'm4', name: 'Masala Dosa', price: 70, emoji: '🥞', dietaryTag: 'veg', category: 'South Indian', description: 'Crispy rice crepe', prepTimeMinutes: 10, available: true }, quantity: 1, subtotal: 70 },
    ],
    total: 70,
    status: 'ready',
    timeSlot: '12:15 - 12:30',
    pickupTime: '12:15',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
];

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );
  }, []);

  const cancelOrder = useCallback((orderId: string) => {
    updateStatus(orderId, 'cancelled');
  }, [updateStatus]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
  }, []);

  const stats = {
    active: orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)).length,
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    completed: orders.filter((o) => o.status === 'completed').length,
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