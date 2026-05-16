/**
 * components/Menu/MenuGrid.tsx
 */

import { useMemo, useState } from 'react';
import type { CartItem, MenuItem, DietaryTag } from '../../types';
import { CategoryPill, DietaryBadge, EmptyState, Skeleton } from '../ui';

interface MenuGridProps {
  items: MenuItem[];
  isLoading: boolean;
  cart: CartItem[];
  onAdd: (item: MenuItem) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

interface CardProps {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onUpdateQty: (delta: number) => void;
}

/* ── Dietary filter config ─────────────────────────────────── */

type DietaryFilter = 'all' | DietaryTag;

const DIETARY_FILTERS: { value: DietaryFilter; label: string; dot: string }[] = [
  { value: 'all', label: 'All', dot: '' },
  { value: 'veg', label: 'Veg', dot: '#16a34a' },
  { value: 'vegan', label: 'Vegan', dot: '#15803d' },
  { value: 'non-veg', label: 'Non-Veg', dot: '#dc2626' },
  { value: 'contains-egg', label: 'Contains Egg', dot: '#d97706' },
];

/* ── DietaryFilterBar (internal) ───────────────────────────── */

function DietaryFilterBar({
  active,
  onChange,
}: {
  active: DietaryFilter;
  onChange: (v: DietaryFilter) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-3">
      {DIETARY_FILTERS.map(({ value, label, dot }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${isActive
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            {dot && (
              <span
                className="h-2 w-2 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: dot }}
                aria-hidden="true"
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ── MenuItemCard (internal) ───────────────────────────────── */

function MenuItemCard({ item, qty, onAdd, onUpdateQty }: CardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-xl bg-white p-3 border border-slate-100 shadow-sm transition-all duration-200 ${item.available
          ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-slate-200'
          : 'opacity-50 pointer-events-none'
        }`}
    >
      {!item.available && (
        <span className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 text-xs font-semibold text-slate-500 backdrop-blur-[1px]">
          Currently unavailable
        </span>
      )}

      <div className="flex items-start justify-between mb-2">
        <span className="text-[28px] leading-none select-none">{item.emoji}</span>
        <DietaryBadge tag={item.dietaryTag} />
      </div>

      <h3 className="text-sm font-semibold text-slate-900 leading-tight">{item.name}</h3>
      <p className="line-clamp-2 mt-0.5 text-xs leading-relaxed text-slate-500">{item.description}</p>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">~{item.prepTimeMinutes} min</span>
      </div>

      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="text-base font-bold text-slate-900">₹{item.price}</span>

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
            <span className="w-5 text-center text-sm font-bold text-slate-900 tabular-nums">{qty}</span>
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

export function MenuGrid({ items, isLoading, cart, onAdd, onUpdateQty }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)));
    return ['All', ...cats];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let result = activeCategory === 'All'
      ? items
      : items.filter((i) => i.category === activeCategory);

    if (dietaryFilter !== 'all') {
      result = result.filter((i) => i.dietaryTag === dietaryFilter);
    }

    if (q) {
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [items, activeCategory, dietaryFilter, query]);

  const qtyMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((ci) => map.set(ci.menuItem.id, ci.quantity));
    return map;
  }, [cart]);

  const activeFiltersCount = (dietaryFilter !== 'all' ? 1 : 0) + (query ? 1 : 0);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-full rounded-xl mb-3" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 flex-shrink-0 rounded-full" />
          ))}
        </div>
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
      {/* Search bar */}
      <div className="relative mb-3">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items or categories…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dietary filter row */}
      <DietaryFilterBar active={dietaryFilter} onChange={setDietaryFilter} />

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

      {/* Active filter summary */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{filtered.length}</span> item{filtered.length !== 1 ? 's' : ''} found
          </p>
          <button
            onClick={() => { setQuery(''); setDietaryFilter('all'); }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Grid or empty */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          }
          title={query ? `No results for "${query}"` : `No ${dietaryFilter} items here`}
          subtitle="Try adjusting your filters or search term."
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