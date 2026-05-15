/**
 * components/MyOrders/MyOrdersView.tsx
 *
 * Lists past and active orders with filter tabs (All / Active / Done).
 * Active orders have a pulsing live banner and auto-refresh every 15s.
 * Each OrderCard shows token code, status badge, item emojis, pickup
 * slot, total, and a "Show QR" button for active orders.
 *
 * Props:
 *   onViewQR — callback to navigate to the QR confirmation screen
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OrderStatus, OrderToken } from '../../types';
import { fetchMyOrders } from '../../services/api';
import { supabase } from '../../services/supabaseClient';
import { subscribeToOrders } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, SectionHeader, Skeleton } from '../ui';

/* ── Status badge config ───────────────────────────────────── */

interface BadgeCfg {
  bg: string;
  text: string;
  label: string;
}

const STATUS_BADGE: Record<OrderStatus, BadgeCfg> = {
  pending_payment: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Pending Payment' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed' },
  preparing: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Preparing' },
  ready: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Ready! 🔔' },
  picked_up: { bg: 'bg-slate-50', text: 'text-slate-500', label: 'Picked Up' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', label: 'Cancelled' },
};

const ACTIVE_STATUSES: OrderStatus[] = ['confirmed', 'preparing', 'ready'];

function isActiveOrder(order: OrderToken): boolean {
  return ACTIVE_STATUSES.includes(order.status);
}

/* ── Filter tabs ───────────────────────────────────────────── */

type FilterTab = 'all' | 'active' | 'done';

/* ── Props ─────────────────────────────────────────────────── */

interface MyOrdersViewProps {
  onViewQR: (token: OrderToken) => void;
  onReorder?: (order: OrderToken) => void;
}

/* ── Component ─────────────────────────────────────────────── */

export function MyOrdersView({ onViewQR, onReorder }: MyOrdersViewProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>('all');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setIsLoading(true);
    try {
      const res = await fetchMyOrders(user?.id);
      setOrders(res.data);
    } catch {
      // silently fail
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, [user?.id]);

  /* Initial load */
  useEffect(() => {
    void load(true);
  }, [load]);

  /* Auto-refresh when there are active orders (mock fallback) */
  const hasActive = useMemo(() => orders.some(isActiveOrder), [orders]);

  useEffect(() => {
    if (!supabase && hasActive) {
      intervalRef.current = setInterval(() => void load(false), 15_000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasActive, load]);

  /* Real-time subscription for Supabase — admin status changes appear live */
  useEffect(() => {
    if (!supabase) return;
    unsubRef.current = subscribeToOrders(() => {
      void load(false);
    });
    return () => {
      unsubRef.current?.();
    };
  }, [load]);

  const filtered = useMemo(() => {
    if (tab === 'active') return orders.filter(isActiveOrder);
    if (tab === 'done') return orders.filter((o) => !isActiveOrder(o));
    return orders;
  }, [orders, tab]);

  const activeCount = useMemo(() => orders.filter(isActiveOrder).length, [orders]);

  /* Tabs */
  const tabs: { key: FilterTab; label: string; badge?: number }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active', badge: activeCount || undefined },
    { key: 'done', label: 'Done' },
  ];

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="px-5 pt-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-[999px]" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 mb-3 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-28">
      <SectionHeader
        title="My Orders"
        subtitle="Track your canteen orders"
        action={
          <button
            onClick={() => void load(true)}
            aria-label="Refresh orders"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm transition-all duration-150 hover:bg-slate-200 active:scale-95"
          >
            ↻
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative rounded-[999px] px-4 py-2 text-xs font-bold transition-all duration-150 active:scale-95 ${
              tab === t.key
                ? 'bg-brand-500 text-white shadow-md'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {t.label}
            {t.badge !== undefined && tab !== t.key && (
              <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={tab === 'active' ? '✨' : tab === 'done' ? '📭' : '🍽️'}
          title={
            tab === 'active'
              ? 'No active orders'
              : tab === 'done'
              ? 'No past orders'
              : 'No orders yet'
          }
          subtitle="Place an order from the menu to see it here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const active = isActiveOrder(order);
            const badge = STATUS_BADGE[order.status];
            const placedAt = new Date(order.placedAt).toLocaleTimeString(
              'en-IN',
              { hour: '2-digit', minute: '2-digit' },
            );

            return (
              <div
                key={order.orderId}
                className={`rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 ${
                  active ? 'ring-2 ring-brand-500 ring-offset-1' : ''
                }`}
              >
                {/* Live banner */}
                {active && (
                  <div className="mb-2 flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-brand-600">
                      Live order — updating every 15s
                    </span>
                  </div>
                )}

                {/* Top row: token + status */}
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-black text-slate-800 tracking-wider">
                    {order.tokenCode}
                  </p>
                  <span
                    className={`rounded-[999px] px-2.5 py-1 text-[10px] font-bold ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Time placed */}
                <p className="mt-1 text-[10px] text-slate-400 font-semibold">
                  Placed at {placedAt}
                </p>

                {/* Item emojis */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {order.items.map((ci) => (
                    <span
                      key={ci.menuItem.id}
                      className="inline-flex items-center gap-1 rounded-[999px] bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                    >
                      {ci.menuItem.emoji} {ci.menuItem.name} ×{ci.quantity}
                    </span>
                  ))}
                </div>

                {/* Bottom row: slot + total + QR */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <div className="text-[10px] text-slate-400 font-semibold">
                    📅 {order.pickupSlot.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">
                      ₹{order.totalAmount}
                    </span>
                    {active && (
                      <button
                        onClick={() => onViewQR(order)}
                        className="rounded-xl bg-brand-500 px-3 py-1.5 text-[10px] font-bold text-white transition-all duration-150 hover:bg-brand-600 active:scale-95"
                      >
                        Show QR
                      </button>
                    )}
                    {!active && order.status === 'picked_up' && onReorder && (
                      <button
                        onClick={() => onReorder(order)}
                        className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold text-indigo-600 transition-all duration-150 hover:bg-indigo-100 hover:border-indigo-300 active:scale-95"
                      >
                        🔄 Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
