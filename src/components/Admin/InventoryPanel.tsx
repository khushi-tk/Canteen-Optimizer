/**
 * components/Admin/InventoryPanel.tsx
 *
 * Admin inventory management. Shows stock levels for every menu item
 * with inline +/- controls and a low-stock threshold editor.
 *
 * Architecture:
 * - Seeded from MOCK_MENU via getDefaultMenu() (same source of truth)
 * - Persists to localStorage via useInventory (same bus as useCrowdData)
 * - Out-of-stock items automatically map to available=false for students
 *   via the MENU_STORAGE_KEY (admin can toggle in MenuManagement, or
 *   the canteen can wire a real backend to sync these)
 * - Follows CrowdControlPanel layout conventions: SectionHeader, max-w card
 */

import { useMemo } from 'react';
import { useInventory, getStockStatus } from '../../hooks/UseInventory';
import type { InventoryItem } from '../../hooks/UseInventory';
import { getDefaultMenu } from '../../services/api';
import { SectionHeader, Skeleton } from '../ui';

/* ── Seed default inventory from MOCK_MENU ──────────────────── */

function buildDefaults(): InventoryItem[] {
  return getDefaultMenu().map((item) => ({
    menuItemId: item.id,
    menuItemName: item.name,
    emoji: item.emoji,
    category: item.category,
    stock: 20,
    lowStockThreshold: 5,
    lastUpdatedAt: new Date().toISOString(),
  }));
}

const DEFAULT_INVENTORY = buildDefaults();

/* ── Status config ──────────────────────────────────────────── */

const STATUS_STYLE = {
  ok:  { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'In Stock' },
  low: { bar: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'Low Stock' },
  out: { bar: 'bg-red-400',     badge: 'bg-red-50 text-red-700 border-red-200',             label: 'Out of Stock' },
};

/* ── Stock bar ──────────────────────────────────────────────── */

function StockBar({ stock, threshold }: { stock: number; threshold: number }) {
  const max = Math.max(stock, threshold * 4, 20);
  const pct = Math.min(100, (stock / max) * 100);
  const status = stock === 0 ? 'out' : stock <= threshold ? 'low' : 'ok';
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${STATUS_STYLE[status].bar}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ── Single inventory row ───────────────────────────────────── */

function InventoryRow({
  item,
  onStockChange,
  onThresholdChange,
}: {
  item: InventoryItem;
  onStockChange: (id: string, v: number) => void;
  onThresholdChange: (id: string, v: number) => void;
}) {
  const status = getStockStatus(item);
  const style = STATUS_STYLE[status];

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${status === 'out' ? 'border-red-200' : status === 'low' ? 'border-amber-200' : 'border-slate-100'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Item info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0">{item.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{item.menuItemName}</p>
            <p className="text-[11px] text-slate-400">{item.category}</p>
          </div>
        </div>
        {/* Status badge */}
        <span className={`flex-shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
          {status === 'out' && '⚠ '}{style.label}
        </span>
      </div>

      {/* Stock bar */}
      <StockBar stock={item.stock} threshold={item.lowStockThreshold} />

      {/* Controls */}
      <div className="mt-3 flex items-center gap-4">
        {/* Stock stepper */}
        <div className="flex-1">
          <p className="text-[10px] font-medium text-slate-500 mb-1.5">Stock (units)</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStockChange(item.menuItemId, item.stock - 1)}
              disabled={item.stock === 0}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold transition-all hover:bg-slate-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              value={item.stock}
              onChange={(e) => onStockChange(item.menuItemId, parseInt(e.target.value) || 0)}
              className="w-14 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={() => onStockChange(item.menuItemId, item.stock + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white font-bold transition-all hover:bg-indigo-700 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Threshold input */}
        <div className="w-28">
          <p className="text-[10px] font-medium text-slate-500 mb-1.5">Alert below</p>
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <input
              type="number"
              min={0}
              value={item.lowStockThreshold}
              onChange={(e) => onThresholdChange(item.menuItemId, parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export function InventoryPanel() {
  const { items, updateStock, updateThreshold, resetAll, stats } = useInventory(DEFAULT_INVENTORY);

  const categorized = useMemo(() => {
    const map = new Map<string, InventoryItem[]>();
    items.forEach((it) => {
      const list = map.get(it.category) ?? [];
      list.push(it);
      map.set(it.category, list);
    });
    return map;
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <SectionHeader
        title="Inventory Tracking"
        subtitle="Track stock levels and get low-stock alerts"
        action={
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all stock to defaults (20 units each)?')) {
                resetAll(buildDefaults());
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Reset
          </button>
        }
      />

      {/* Summary row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-700 tabular-nums">{stats.ok}</p>
          <p className="text-[11px] font-medium text-emerald-600 mt-0.5">In Stock</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-700 tabular-nums">{stats.low}</p>
          <p className="text-[11px] font-medium text-amber-600 mt-0.5">Low Stock</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-red-700 tabular-nums">{stats.out}</p>
          <p className="text-[11px] font-medium text-red-600 mt-0.5">Out of Stock</p>
        </div>
      </div>

      {/* Alert banner when issues exist */}
      {(stats.out > 0 || stats.low > 0) && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <svg className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-xs font-medium text-amber-800">
            {stats.out > 0 && `${stats.out} item${stats.out > 1 ? 's' : ''} out of stock. `}
            {stats.low > 0 && `${stats.low} item${stats.low > 1 ? 's' : ''} running low.`}
            {' '}Update quantities or mark items unavailable in Menu.
          </p>
        </div>
      )}

      {/* Items grouped by category */}
      {Array.from(categorized.entries()).map(([category, catItems]) => (
        <div key={category} className="mb-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{category}</h3>
          <div className="space-y-2">
            {catItems.map((item) => (
              <InventoryRow
                key={item.menuItemId}
                item={item}
                onStockChange={updateStock}
                onThresholdChange={updateThreshold}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}