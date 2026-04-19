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
      className={`relative flex flex-col rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 ${
        item.available
          ? 'hover:-translate-y-0.5 hover:shadow-md'
          : 'opacity-50 pointer-events-none'
      }`}
    >
      {/* Unavailable overlay */}
      {!item.available && (
        <span className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 text-[10px] font-bold text-slate-500">
          Currently unavailable
        </span>
      )}

      {/* Top row: emoji + badge */}
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[32px] leading-none">{item.emoji}</span>
        <DietaryBadge tag={item.dietaryTag} />
      </div>

      {/* Name + description */}
      <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
        {item.name}
      </h3>
      <p className="line-clamp-2 mt-0.5 text-[11px] leading-snug text-slate-400">
        {item.description}
      </p>

      {/* Prep time */}
      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
        <span>🕐</span>
        <span className="font-semibold">~{item.prepTimeMinutes}m prep</span>
      </div>

      {/* Price + Add / Stepper */}
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="text-base font-black text-slate-800">
          ₹{item.price}
        </span>

        {qty === 0 ? (
          <button
            onClick={onAdd}
            aria-label={`Add ${item.name} to cart`}
            className="flex items-center gap-1 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-[0_8px_24px_rgba(249,115,22,0.35)] transition-all duration-150 hover:bg-brand-600 active:scale-95"
          >
            <span className="text-sm">+</span> Add
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQty(-1)}
              aria-label={`Decrease ${item.name} quantity`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold transition-all duration-150 active:scale-95"
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-black text-slate-800">
              {qty}
            </span>
            <button
              onClick={() => onUpdateQty(1)}
              aria-label={`Increase ${item.name} quantity`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white font-bold transition-all duration-150 active:scale-95"
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
            <Skeleton key={i} className="h-8 w-20 flex-shrink-0 rounded-[999px]" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
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
          icon="🍽️"
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
