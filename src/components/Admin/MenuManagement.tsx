/**
 * components/Admin/MenuManagement.tsx
 *
 * Full CRUD menu management panel for canteen admins.
 *
 * Architecture notes (matches existing codebase patterns):
 * - State lives in localStorage under MENU_STORAGE_KEY (same bus
 *   pattern as useCrowdData / useCrowdStatus — student MenuGrid
 *   reads from fetchMenu() which checks localStorage first)
 * - No external form library — plain onChange handlers
 * - Follows CrowdControlPanel's layout: SectionHeader + max-w card
 * - All MenuItem fields are editable: name, price, emoji, category,
 *   dietaryTag, description, prepTimeMinutes, available
 * - Add new item (generates unique id), Edit existing, Delete
 * - "Reset to defaults" restores MOCK_MENU via getDefaultMenu()
 * - Changes save immediately to localStorage on Submit/Toggle/Delete
 */

import { useState, useEffect, useCallback } from 'react';
import type { MenuItem, DietaryTag } from '../../types';
import { MENU_STORAGE_KEY, getDefaultMenu } from '../../services/api';
import { SectionHeader, Skeleton } from '../ui';

/* ── Constants ─────────────────────────────────────────────── */

const DIETARY_OPTIONS: { value: DietaryTag; label: string; color: string }[] = [
  { value: 'veg',          label: '🌿 Veg',          color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'non-veg',      label: '🍖 Non-Veg',      color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'vegan',        label: '🌱 Vegan',         color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'contains-egg', label: '🥚 Contains Egg', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
];

const ALL_CATEGORIES = [
  'South Indian', 'North Indian', 'Rice', 'Rolls',
  'Curry', 'Burgers', 'Snacks', 'Beverages', 'Desserts', 'Other',
];

/* ── Types ─────────────────────────────────────────────────── */

type ModalMode = 'add' | 'edit';

interface FormState {
  name: string;
  price: string;
  emoji: string;
  category: string;
  customCategory: string;
  dietaryTag: DietaryTag;
  description: string;
  prepTimeMinutes: string;
  available: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  price: '',
  emoji: '🍽️',
  category: 'South Indian',
  customCategory: '',
  dietaryTag: 'veg',
  description: '',
  prepTimeMinutes: '',
  available: true,
};

/* ── Local storage helpers ──────────────────────────────────── */

function loadMenu(): MenuItem[] | null {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MenuItem[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveMenu(items: MenuItem[]): void {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
  // Dispatch storage event so student tabs pick up the change
  window.dispatchEvent(new StorageEvent('storage', {
    key: MENU_STORAGE_KEY,
    newValue: JSON.stringify(items),
  }));
}

function generateId(name: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 8);
  return `${slug}-${Date.now().toString(36)}`;
}

/* ── Dietary badge ─────────────────────────────────────────── */

function DietBadge({ tag }: { tag: DietaryTag }) {
  const opt = DIETARY_OPTIONS.find((d) => d.value === tag)!;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${opt.color}`}>
      {opt.label}
    </span>
  );
}

/* ── Availability toggle ────────────────────────────────────── */

function AvailToggle({ available, onChange }: { available: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${available ? 'bg-emerald-500' : 'bg-slate-200'}`}
      role="switch"
      aria-checked={available}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${available ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

/* ── Form modal ─────────────────────────────────────────────── */

interface ItemModalProps {
  mode: ModalMode;
  initial: FormState;
  onSave: (f: FormState) => void;
  onClose: () => void;
}

function ItemModal({ mode, initial, onSave, onClose }: ItemModalProps) {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) e.price = 'Enter a valid price';
    const prep = parseInt(form.prepTimeMinutes);
    if (isNaN(prep) || prep <= 0) e.prepTimeMinutes = 'Enter prep time in minutes';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.emoji.trim()) e.emoji = 'Pick an emoji';
    if (form.category === 'Other' && !form.customCategory.trim())
      e.customCategory = 'Enter a category name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form);
  };

  const inputClass = (field: keyof FormState) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            {mode === 'add' ? '+ Add Menu Item' : 'Edit Item'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto max-h-[70vh] px-5 py-4 space-y-4">
          {/* Emoji + Name row */}
          <div className="flex gap-3">
            <div className="w-20">
              <label className="block text-xs font-medium text-slate-600 mb-1">Emoji</label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => set('emoji', e.target.value)}
                maxLength={2}
                className={`${inputClass('emoji')} text-center text-xl`}
              />
              {errors.emoji && <p className="mt-1 text-[10px] text-red-500">{errors.emoji}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Item Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Masala Dosa"
                className={inputClass('name')}
              />
              {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name}</p>}
            </div>
          </div>

          {/* Price + Prep time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹) *</label>
              <input
                type="number"
                min={1}
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="60"
                className={inputClass('price')}
              />
              {errors.price && <p className="mt-1 text-[10px] text-red-500">{errors.price}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Prep Time (min) *</label>
              <input
                type="number"
                min={1}
                value={form.prepTimeMinutes}
                onChange={(e) => set('prepTimeMinutes', e.target.value)}
                placeholder="8"
                className={inputClass('prepTimeMinutes')}
              />
              {errors.prepTimeMinutes && <p className="mt-1 text-[10px] text-red-500">{errors.prepTimeMinutes}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={inputClass('category')}
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {form.category === 'Other' && (
              <input
                type="text"
                value={form.customCategory}
                onChange={(e) => set('customCategory', e.target.value)}
                placeholder="Enter category name"
                className={`mt-2 ${inputClass('customCategory')}`}
              />
            )}
            {errors.customCategory && <p className="mt-1 text-[10px] text-red-500">{errors.customCategory}</p>}
          </div>

          {/* Dietary tag */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Dietary Tag *</label>
            <div className="grid grid-cols-2 gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('dietaryTag', opt.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium text-left transition-all ${form.dietaryTag === opt.value ? `${opt.color} ring-2 ring-indigo-400 ring-offset-1` : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Describe the dish..."
              className={`${inputClass('description')} resize-none`}
            />
            {errors.description && <p className="mt-1 text-[10px] text-red-500">{errors.description}</p>}
          </div>

          {/* Available toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Available Today</p>
              <p className="text-xs text-slate-500">Students can see and order this item</p>
            </div>
            <AvailToggle available={form.available} onChange={() => set('available', !form.available)} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all"
          >
            {mode === 'add' ? 'Add Item' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete confirmation ────────────────────────────────────── */

function DeleteConfirm({ item, onConfirm, onCancel }: {
  item: MenuItem;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
          {item.emoji}
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Remove Item?</h3>
        <p className="text-sm text-slate-500 mb-5">
          <span className="font-medium text-slate-700">{item.name}</span> will be removed from the menu. Students won't be able to order it.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 active:scale-95 transition-all"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: ModalMode; item?: MenuItem } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  /* Load on mount */
  useEffect(() => {
    const stored = loadMenu();
    setItems(stored ?? getDefaultMenu());
    setIsLoading(false);
  }, []);

  /* Toast helper */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* Persist and update state */
  const persist = useCallback((next: MenuItem[]) => {
    setItems(next);
    saveMenu(next);
  }, []);

  /* Toggle availability inline (no modal needed) */
  const toggleAvailable = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((m) =>
        m.id === id ? { ...m, available: !m.available } : m,
      );
      saveMenu(next);
      return next;
    });
  }, []);

  /* Save from modal */
  const handleSave = useCallback((form: FormState) => {
    const category = form.category === 'Other' ? form.customCategory.trim() : form.category;
    if (modal?.mode === 'add') {
      const newItem: MenuItem = {
        id: generateId(form.name),
        name: form.name.trim(),
        price: parseFloat(form.price),
        emoji: form.emoji.trim() || '🍽️',
        category,
        dietaryTag: form.dietaryTag,
        description: form.description.trim(),
        prepTimeMinutes: parseInt(form.prepTimeMinutes),
        available: form.available,
      };
      persist([...items, newItem]);
      showToast(`${newItem.emoji} ${newItem.name} added`);
    } else if (modal?.mode === 'edit' && modal.item) {
      persist(
        items.map((m) =>
          m.id === modal.item!.id
            ? {
                ...m,
                name: form.name.trim(),
                price: parseFloat(form.price),
                emoji: form.emoji.trim() || m.emoji,
                category,
                dietaryTag: form.dietaryTag,
                description: form.description.trim(),
                prepTimeMinutes: parseInt(form.prepTimeMinutes),
                available: form.available,
              }
            : m,
        ),
      );
      showToast('Changes saved');
    }
    setModal(null);
  }, [modal, items, persist, showToast]);

  /* Delete */
  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    persist(items.filter((m) => m.id !== deleteTarget.id));
    showToast(`${deleteTarget.name} removed`);
    setDeleteTarget(null);
  }, [deleteTarget, items, persist, showToast]);

  /* Reset to defaults */
  const handleReset = useCallback(() => {
    if (!confirm('Reset to default menu? All your changes will be lost.')) return;
    const defaults = getDefaultMenu();
    persist(defaults);
    showToast('Menu reset to defaults');
  }, [persist, showToast]);

  /* Filtered list */
  const categories = ['All', ...Array.from(new Set(items.map((m) => m.category))).sort()];
  const filtered = items.filter((m) => {
    const matchCat = filterCategory === 'All' || m.category === filterCategory;
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  /* Open edit modal */
  const openEdit = (item: MenuItem) => {
    setModal({
      mode: 'edit',
      item,
    });
  };

  const editForm = (item: MenuItem): FormState => ({
    name: item.name,
    price: String(item.price),
    emoji: item.emoji,
    category: ALL_CATEGORIES.includes(item.category) ? item.category : 'Other',
    customCategory: ALL_CATEGORIES.includes(item.category) ? '' : item.category,
    dietaryTag: item.dietaryTag,
    description: item.description,
    prepTimeMinutes: String(item.prepTimeMinutes),
    available: item.available,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  const availableCount = items.filter((m) => m.available).length;

  return (
    <div className="max-w-2xl">
      <SectionHeader
        title="Menu Management"
        subtitle={`${availableCount} of ${items.length} items available`}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reset
            </button>
            <button
              type="button"
              onClick={() => setModal({ mode: 'add' })}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Item
            </button>
          </div>
        }
      />

      {/* Search + filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400"
          />
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Item list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <span className="text-3xl mb-3">🍽️</span>
          <p className="text-sm font-medium text-slate-600">No items found</p>
          <p className="text-xs text-slate-400 mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm transition-all ${!item.available ? 'opacity-60 border-slate-200' : 'border-slate-200 hover:border-indigo-200'}`}
            >
              {/* Emoji */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl border border-slate-100">
                {item.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                  <DietBadge tag={item.dietaryTag} />
                  {!item.available && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      Unavailable
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-sm font-bold text-slate-800">₹{item.price}</span>
                  <span className="text-[11px] text-slate-400">{item.category}</span>
                  <span className="text-[11px] text-slate-400">⏱ {item.prepTimeMinutes}m</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Availability toggle */}
                <AvailToggle available={item.available} onChange={() => toggleAvailable(item.id)} />

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                  aria-label="Edit item"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                  aria-label="Delete item"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <ItemModal
          mode={modal.mode}
          initial={modal.mode === 'edit' && modal.item ? editForm(modal.item) : EMPTY_FORM}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          item={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <svg className="h-4 w-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}