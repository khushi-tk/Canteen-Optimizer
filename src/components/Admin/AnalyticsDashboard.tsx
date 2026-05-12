/**
 * components/Admin/AnalyticsDashboard.tsx
 *
 * Analytics tab for the admin panel. Derives all metrics from the
 * existing Order[] and stats object already computed in useAdminOrders —
 * no new data fetching required.
 */

import { useMemo } from 'react';
import type { Order } from '../../types';
import { SectionHeader } from '../ui';

interface AnalyticsDashboardProps {
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
}

/* ── Stat Card ─────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent: string; // Tailwind bg class for the left border/dot
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, accent, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
        <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Mini Bar ──────────────────────────────────────────────── */

interface MiniBarProps {
  label: string;
  count: number;
  max: number;
  colorClass: string;
}

function MiniBar({ label, count, max, colorClass }: MiniBarProps) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs font-medium text-slate-600 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-xs font-semibold text-slate-700 text-right shrink-0">{count}</span>
    </div>
  );
}

/* ── Top Items Table ───────────────────────────────────────── */

interface TopItem {
  name: string;
  emoji: string;
  qty: number;
  revenue: number;
}

function TopItemsTable({ items }: { items: TopItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400 py-4 text-center">No order data yet.</p>;
  }
  return (
    <div className="divide-y divide-slate-100">
      {items.map((item, idx) => (
        <div key={item.name} className="flex items-center gap-3 py-2.5">
          <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
          <span className="text-base leading-none">{item.emoji}</span>
          <span className="flex-1 text-sm font-medium text-slate-800 truncate">{item.name}</span>
          <span className="text-xs text-slate-500">{item.qty} sold</span>
          <span className="text-xs font-semibold text-indigo-600 w-16 text-right">
            ₹{item.revenue}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Fulfillment Rate Ring ─────────────────────────────────── */

function FulfillmentRing({ rate }: { rate: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = circ * (rate / 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={rate >= 80 ? '#6366f1' : rate >= 50 ? '#f59e0b' : '#ef4444'}
          strokeWidth="7"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
        <text x="36" y="40" textAnchor="middle" className="text-xs" fontSize="13" fontWeight="700" fill="#1e293b">
          {rate}%
        </text>
      </svg>
      <p className="text-xs text-slate-500 font-medium">Fulfillment</p>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */

export function AnalyticsDashboard({ orders, stats }: AnalyticsDashboardProps) {
  const derived = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrNot = orders.filter((o) => o.status !== 'cancelled');
    const avgOrderValue =
      completedOrNot.length > 0
        ? Math.round(stats.revenue / completedOrNot.length)
        : 0;

    const fulfillmentRate =
      totalOrders > 0
        ? Math.round((stats.completed / totalOrders) * 100)
        : 0;

    // Top menu items by quantity across all non-cancelled orders
    const itemMap = new Map<string, TopItem>();
    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      for (const oi of order.items) {
        const key = oi.menuItem.id;
        const existing = itemMap.get(key);
        if (existing) {
          existing.qty += oi.quantity;
          existing.revenue += oi.subtotal;
        } else {
          itemMap.set(key, {
            name: oi.menuItem.name,
            emoji: oi.menuItem.emoji,
            qty: oi.quantity,
            revenue: oi.subtotal,
          });
        }
      }
    }
    const topItems = [...itemMap.values()]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Category revenue breakdown
    const catMap = new Map<string, number>();
    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      for (const oi of order.items) {
        const cat = oi.menuItem.category;
        catMap.set(cat, (catMap.get(cat) ?? 0) + oi.subtotal);
      }
    }
    const maxCatRevenue = Math.max(...catMap.values(), 1);
    const categories = [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, rev]) => ({ name, rev, max: maxCatRevenue }));

    return { totalOrders, avgOrderValue, fulfillmentRate, topItems, categories };
  }, [orders, stats]);

  const statusMax = Math.max(
    stats.pending,
    stats.preparing,
    stats.ready,
    stats.completed,
    stats.cancelled,
    1,
  );

  return (
    <div className="max-w-2xl space-y-6">
      <SectionHeader
        title="Analytics"
        subtitle="Session overview — resets on page reload"
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={derived.totalOrders}
          accent="bg-indigo-100"
          icon={
            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25" />
            </svg>
          }
        />
        <StatCard
          label="Revenue"
          value={`₹${stats.revenue}`}
          accent="bg-emerald-100"
          icon={
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Avg. Order"
          value={`₹${derived.avgOrderValue}`}
          accent="bg-sky-100"
          icon={
            <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <StatCard
          label="Active Now"
          value={stats.active}
          sub={`${stats.pending} pending · ${stats.preparing} prep`}
          accent="bg-amber-100"
          icon={
            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Order status breakdown + fulfillment ring */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Order Status Breakdown</h3>
            <div className="space-y-2.5">
              <MiniBar label="Pending" count={stats.pending} max={statusMax} colorClass="bg-amber-400" />
              <MiniBar label="Preparing" count={stats.preparing} max={statusMax} colorClass="bg-blue-400" />
              <MiniBar label="Ready" count={stats.ready} max={statusMax} colorClass="bg-emerald-400" />
              <MiniBar label="Completed" count={stats.completed} max={statusMax} colorClass="bg-indigo-500" />
              <MiniBar label="Cancelled" count={stats.cancelled} max={statusMax} colorClass="bg-red-400" />
            </div>
          </div>
          <FulfillmentRing rate={derived.fulfillmentRate} />
        </div>
      </div>

      {/* Top items */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Top-Selling Items</h3>
        <p className="text-xs text-slate-400 mb-3">Ranked by units sold (non-cancelled orders)</p>
        <TopItemsTable items={derived.topItems} />
      </div>

      {/* Revenue by category */}
      {derived.categories.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Revenue by Category</h3>
          <div className="space-y-2.5">
            {derived.categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="w-24 text-xs font-medium text-slate-600 shrink-0 truncate">{cat.name}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                    style={{ width: `${Math.round((cat.rev / cat.max) * 100)}%` }}
                  />
                </div>
                <span className="w-14 text-xs font-semibold text-slate-700 text-right shrink-0">₹{cat.rev}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}