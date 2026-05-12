/**
 * components/Menu/MenuGrid.tsx
 *
 * 2-column grid of MenuItemCards with a horizontally-scrollable category
 * filter strip.  Each card shows emoji, dietary badge, name, description,
 * prep time, price, and an Add / Stepper control.
 *
 * Props:
 *   items        — full menu array
 *   isLoading    — show skeleton grid
 *   cart         — current cart items (for stepper state)
 *   onAdd        — callback when "+" / "Add" is tapped
 *   onUpdateQty  — callback for stepper delta (-1 / +1)
 */

import { useMemo, useState } from 'react';
import type { CartItem, MenuItem } from '../../types';
import { CategoryPill, DietaryBadge, EmptyState, Skeleton } from '../ui';

/* ── Props ─────────────────────────────────────────────────── */

interface MenuGridProps {
  items: MenuItem[];
  isLoading: boolean;
  cart: CartItem[];
  onAdd: (item: MenuItem) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

/* ── MenuItemCard (internal) ───────────────────────────────── */

interface CardProps {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onUpdateQty: (delta: number) => void;
}

function MenuItemCard({ item, qty, onAdd, onUpdateQty }: CardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-xl bg-white p-3 border border-slate-100 shadow-sm transition-all duration-200 ${
        item.available
          ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-slate-200'
          : 'opacity-50 pointer-events-none'
      }`}
    >
      {/* Unavailable overlay */}
      {!item.available && (
        <span className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 text-xs font-semibold text-slate-500 backdrop-blur-[1px]">
          Currently unavailable
        </span>
      )}

      {/* Top row: emoji + badge */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-[28px] leading-none select-none">{item.emoji}</span>
        <DietaryBadge tag={item.dietaryTag} />
      </div>

      {/* Name + description */}
      <h3 className="text-sm font-semibold text-slate-900 leading-tight">
        {item.name}
      </h3>
      <p className="line-clamp-2 mt-0.5 text-xs leading-relaxed text-slate-500">
        {item.description}
      </p>

      {/* Prep time */}
      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">~{item.prepTimeMinutes} min</span>
      </div>

      {/* Price + Add / Stepper */}
      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="text-base font-bold text-slate-900">
          ₹{item.price}
        </span>

        {qty === 0 ? (
          <button
            onClick={onAdd}
            aria-label={`Add ${item.name} to cart`}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            <span className="text-sm leading-none">+</span> Add
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQty(-1)}
              aria-label={`Decrease ${item.name} quantity`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold transition-all duration-150 hover:bg-slate-200 active:scale-95"
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-bold text-slate-900 tabular-nums">
              {qty}
            </span>
            <button
              onClick={() => onUpdateQty(1)}
              aria-label={`Increase ${item.name} quantity`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold transition-all duration-150 hover:bg-indigo-700 active:scale-95"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MenuGrid ──────────────────────────────────────────────── */

export function MenuGrid({
  items,
  isLoading,
  cart,
  onAdd,
  onUpdateQty,
}: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)));
    return ['All', ...cats];
  }, [items]);

  const filtered = useMemo(
    () =>
      activeCategory === 'All'
        ? items
        : items.filter((i) => i.category === activeCategory),
    [items, activeCategory],
  );

  const qtyMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((ci) => map.set(ci.menuItem.id, ci.quantity));
    return map;
  }, [cart]);

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 flex-shrink-0 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Category strip */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
        {categories.map((cat) => (
          <CategoryPill
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* Grid or empty */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="No items in this category"
          subtitle="Try another category or check back later."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              qty={qtyMap.get(item.id) ?? 0}
              onAdd={() => onAdd(item)}
              onUpdateQty={(delta) => onUpdateQty(item.id, delta)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
