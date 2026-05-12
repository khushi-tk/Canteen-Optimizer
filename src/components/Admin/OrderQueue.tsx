/**
 * components/Admin/OrderQueue.tsx
 */

import { useState, useMemo } from 'react';
import type { Order, OrderStatus } from '../../types';
import { Spinner, EmptyState } from '../ui';

interface OrderQueueProps {
  orders: Order[];
  stats: {
    active: number;
    pending: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
    revenue: number;
  };
  isLoading: boolean;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancel: (orderId: string) => void;
}

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  next?: OrderStatus;
  nextLabel?: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending_payment: {
    label: 'Pending',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    next: 'confirmed',
    nextLabel: 'Confirm',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    next: 'preparing',
    nextLabel: 'Start Preparing',
  },
  preparing: {
    label: 'Preparing',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    next: 'ready',
    nextLabel: 'Mark Ready',
  },
  ready: {
    label: 'Ready',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    next: 'picked_up',
    nextLabel: 'Picked Up',
  },
  picked_up: {
    label: 'Picked Up',
    color: 'text-slate-600',
    bg: 'bg-slate-50 border-slate-200',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
};

export function OrderQueue({ orders, stats, isLoading, onUpdateStatus, onCancel }: OrderQueueProps) {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState<string>('');

  const filtered = useMemo(() => {
    let result = orders;
    if (filter !== 'all') result = result.filter((o: Order) => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o: Order) =>
          o.studentName.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.items.some((i) => i.menuItem.name.toLowerCase().includes(q))
      );
    }
    return result.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, filter, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Active" value={stats.active} color="indigo" />
        <StatCard label="Pending" value={stats.pending} color="amber" />
        <StatCard label="Ready" value={stats.ready} color="emerald" />
        <StatCard label="Revenue" value={`₹${stats.revenue}`} color="slate" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search orders, students, items..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {(['all', 'pending_payment', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'] as const).map((s: OrderStatus | 'all') => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                filter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              {s !== 'all' && (
                <span className="ml-1 opacity-75">
                  {s === 'pending_payment' ? stats.pending : s === 'confirmed' ? stats.preparing : s === 'preparing' ? stats.preparing : s === 'ready' ? stats.ready : s === 'picked_up' ? stats.completed : stats.cancelled}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" />
            </svg>
          }
          title="No orders found"
          subtitle={search ? 'Try adjusting your search or filters' : 'Orders will appear here when students place them'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order: Order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Stat Card ─────────────────────────────────────────────── */

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    slate: 'bg-slate-50 text-slate-700',
  };

  return (
    <div className={`rounded-xl border border-slate-100 p-3 ${colorMap[color] || 'bg-slate-50'}`}>
      <p className="text-xs font-medium opacity-75 mb-0.5">{label}</p>
      <p className="text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

/* ── Order Card ────────────────────────────────────────────── */

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (id: string, s: OrderStatus) => void;
  onCancel: (id: string) => void;
}

function OrderCard({ order, onUpdateStatus, onCancel }: OrderCardProps) {
  const config = STATUS_CONFIG[order.status];
  const timeAgo = getTimeAgo(order.createdAt);

  return (
    <div className={`rounded-xl border p-4 transition-shadow hover:shadow-sm ${config.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.color} bg-white/80`}>
            {config.label}
          </span>
          <span className="text-xs text-slate-500 font-medium">{order.id}</span>
        </div>
        <span className="text-[10px] text-slate-400">{timeAgo}</span>
      </div>

      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-900">{order.studentName}</p>
        <p className="text-xs text-slate-500">{order.studentEmail}</p>
      </div>

      <div className="space-y-1.5 mb-3">
        {order.items.map((item, idx: number) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <span className="text-base">{item.menuItem.emoji}</span>
            <span className="flex-1 text-slate-700">{item.menuItem.name}</span>
            <span className="text-xs text-slate-500">×{item.quantity}</span>
            <span className="text-sm font-medium text-slate-900 tabular-nums">₹{item.subtotal}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-black/5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Pickup: {order.timeSlot}</span>
        </div>
        <span className="text-sm font-bold text-slate-900 tabular-nums">₹{order.total}</span>
      </div>

      <div className="flex gap-2 mt-3">
        {config.next && (
          <button
            onClick={() => onUpdateStatus(order.id, config.next!)}
            className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            {config.nextLabel}
          </button>
        )}
        {order.status !== 'picked_up' && order.status !== 'cancelled' && (
          <button
            onClick={() => onCancel(order.id)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}