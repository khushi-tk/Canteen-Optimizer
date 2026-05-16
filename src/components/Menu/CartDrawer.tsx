/**
 * components/Menu/CartDrawer.tsx
 *
 * Bottom-sheet cart drawer with optional Group Ordering mode.
 *
 * Group Ordering:
 * - Toggle "Group Order" in the expanded cart header
 * - Add member names (e.g. "Ritam", "Priya")
 * - Each cart item can be assigned to a member
 * - A split summary shows each person's share
 * - All state is local; no new types or API changes needed
 */

import { useState, useCallback, useMemo } from 'react';
import type { CartItem } from '../../types';

interface CartDrawerProps {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: () => void;
}

interface GroupMember {
  id: string;
  name: string;
}

const MEMBER_COLORS = [
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-sky-100 text-sky-700 border-sky-200',
];

function memberColor(idx: number) {
  return MEMBER_COLORS[idx % MEMBER_COLORS.length];
}

function GroupPanel({
  members,
  itemAssignments,
  cart,
  onAddMember,
  onRemoveMember,
  onAssign,
}: {
  members: GroupMember[];
  itemAssignments: Map<string, string>;
  cart: CartItem[];
  onAddMember: (name: string) => void;
  onRemoveMember: (id: string) => void;
  onAssign: (itemId: string, memberId: string) => void;
}) {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddMember(trimmed);
    setNewName('');
  };

  return (
    <div className="border-t border-slate-100 pt-3 pb-1">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Group Members</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {members.map((m, idx) => (
          <span key={m.id} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${memberColor(idx)}`}>
            {m.name}
            <button type="button" onClick={() => onRemoveMember(m.id)} className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity" aria-label={`Remove ${m.name}`}>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        {members.length === 0 && <p className="text-xs text-slate-400 italic">No members yet — add some below</p>}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add member name…"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
          maxLength={24}
        />
        <button type="button" onClick={handleAdd} disabled={!newName.trim()} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          Add
        </button>
      </div>

      {members.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Items to Members</p>
          {cart.map((ci) => {
            const assignedId = itemAssignments.get(ci.menuItem.id);
            return (
              <div key={ci.menuItem.id} className="flex items-center gap-2 py-2 border-b border-slate-50 last:border-0">
                <span className="text-base flex-shrink-0">{ci.menuItem.emoji}</span>
                <p className="flex-1 text-xs font-medium text-slate-700 truncate min-w-0">{ci.menuItem.name} ×{ci.quantity}</p>
                <div className="flex gap-1 flex-wrap justify-end">
                  {members.map((m, idx) => (
                    <button key={m.id} type="button" onClick={() => onAssign(ci.menuItem.id, m.id)}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all active:scale-95 ${assignedId === m.id ? memberColor(idx) + ' ring-1 ring-offset-1 ring-indigo-400' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export function CartDrawer({ cart, cartCount, cartTotal, onUpdateQty, onCheckout }: CartDrawerProps) {
  const [expanded, setExpanded] = useState(false);
  const [groupMode, setGroupMode] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [itemAssignments, setItemAssignments] = useState<Map<string, string>>(new Map());

  const addMember = useCallback((name: string) => {
    setMembers((prev) => [...prev, { id: `m-${Date.now()}`, name }]);
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setItemAssignments((prev) => {
      const next = new Map(prev);
      for (const [itemId, mId] of next) {
        if (mId === id) next.delete(itemId);
      }
      return next;
    });
  }, []);

  const assignItem = useCallback((itemId: string, memberId: string) => {
    setItemAssignments((prev) => {
      const next = new Map(prev);
      if (next.get(itemId) === memberId) {
        next.delete(itemId);
      } else {
        next.set(itemId, memberId);
      }
      return next;
    });
  }, []);

  const toggleGroupMode = useCallback(() => {
    setGroupMode((v) => {
      if (v) {
        setMembers([]);
        setItemAssignments(new Map());
      }
      return !v;
    });
  }, []);

  const groupSummary = useMemo(() => {
    if (!groupMode || members.length === 0) return null;
    const totals = new Map<string, number>();
    let unassigned = 0;
    cart.forEach((ci) => {
      const mId = itemAssignments.get(ci.menuItem.id);
      const subtotal = ci.menuItem.price * ci.quantity;
      if (mId) totals.set(mId, (totals.get(mId) ?? 0) + subtotal);
      else unassigned += subtotal;
    });
    const parts = members.filter((m) => totals.has(m.id)).map((m) => `${m.name}: ₹${totals.get(m.id)}`);
    if (unassigned > 0) parts.push(`Unassigned: ₹${unassigned}`);
    return parts;
  }, [groupMode, members, cart, itemAssignments]);

  if (cartCount === 0) return null;

  return (
    <>
      {expanded && (
        <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-300" onClick={() => setExpanded(false)} />
      )}

      <div
        className="fixed left-0 right-0 z-[55] mx-auto w-full max-w-[390px]"
        style={{
          bottom: expanded ? 0 : 56,
          height: expanded ? '78vh' : 80,
          transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1), bottom 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex h-full flex-col rounded-t-2xl border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {/* Handle + summary bar */}
          <button onClick={() => setExpanded((e) => !e)} className="flex w-full flex-col items-center px-5 pt-3 pb-2 transition-colors active:bg-slate-50" aria-label={expanded ? 'Collapse cart' : 'Expand cart'}>
            <div className="mb-3 h-1 w-10 rounded-full bg-slate-300" />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="text-2xl">🛒</span>
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">{cartCount}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">
                    {cartCount} item{cartCount > 1 ? 's' : ''} in cart
                    {groupMode && members.length > 0 && (
                      <span className="ml-1.5 text-[10px] font-bold text-indigo-600">· {members.length} members</span>
                    )}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">{expanded ? 'Tap to collapse' : 'Tap to review'}</p>
                </div>
              </div>
              <p className="text-base font-bold tabular-nums text-slate-900">₹{cartTotal}</p>
            </div>
          </button>

          {/* Expanded content */}
          {expanded && (
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              {/* Group order toggle */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">👥</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Group Order</p>
                    <p className="text-[10px] text-slate-500">Split the bill among friends</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleGroupMode}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${groupMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  role="switch"
                  aria-checked={groupMode}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${groupMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {groupMode && (
                <GroupPanel
                  members={members}
                  itemAssignments={itemAssignments}
                  cart={cart}
                  onAddMember={addMember}
                  onRemoveMember={removeMember}
                  onAssign={assignItem}
                />
              )}

              {/* Cart items (only shown when not in group mode, group mode has its own layout) */}
              {!groupMode && cart.map((ci) => (
                <div key={ci.menuItem.id} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
                  <span className="select-none text-2xl">{ci.menuItem.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{ci.menuItem.name}</p>
                    <p className="text-xs text-slate-400">₹{ci.menuItem.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onUpdateQty(ci.menuItem.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 transition-all duration-150 hover:bg-slate-200 active:scale-95">−</button>
                    <span className="w-5 text-center text-sm font-black text-slate-800">{ci.quantity}</span>
                    <button type="button" onClick={() => onUpdateQty(ci.menuItem.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 font-bold text-white transition-all duration-150 active:scale-95">+</button>
                  </div>
                  <p className="w-12 text-right text-sm font-extrabold text-slate-800">₹{ci.menuItem.price * ci.quantity}</p>
                </div>
              ))}

              {/* Split summary */}
              {groupSummary && groupSummary.length > 0 && (
                <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1.5">Split Summary</p>
                  {groupSummary.map((line) => (
                    <p key={line} className="text-xs font-medium text-indigo-800">{line}</p>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-600">Total</span>
                <span className="text-lg font-bold tabular-nums text-slate-900">₹{cartTotal}</span>
              </div>
            </div>
          )}

          {/* Checkout button */}
          <div className="px-5 pb-5 pt-3">
            <button
              type="button"
              onClick={() => {
                if (!expanded) setExpanded(true);
                else onCheckout();
              }}
              className="w-full rounded-2xl bg-indigo-600 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              {!expanded ? `Review & Checkout — ₹${cartTotal} →` : `Proceed to Checkout — ₹${cartTotal}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}