/**
* components/Menu/CartDrawer.tsx
 * components/Menu/CartDrawer.tsx
 *
 *
 * Professional bottom-sheet cart drawer for CanteenCrowd.
 * Bottom-sheet style cart drawer that sits above the BottomNav.
 * Collapsed peek shows count + total. Expanded reveals item list,
 * Collapsed state shows item count + total + checkout CTA.
 * steppers, and checkout CTA.
 */

import { useState } from 'react';
import type { CartItem } from '../../types';

interface CartDrawerProps {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  cart,
  cartCount,
  cartTotal,
  onUpdateQty,
  onCheckout,
}: CartDrawerProps) {
  const [expanded, setExpanded] = useState(false);

  if (cartCount === 0) return null;

  return (
    <>
      {/* Backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed left-0 right-0 z-[55] mx-auto w-full max-w-[390px]"
        style={{
          bottom: expanded ? 0 : 56,
          height: expanded ? '75vh' : 80,
          transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1), bottom 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex h-full flex-col rounded-t-2xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-slate-100">
          {/* Drag handle / header */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex w-full flex-col items-center px-5 pt-3 pb-2 active:bg-slate-50 transition-colors"
            aria-label={expanded ? 'Collapse cart' : 'Expand cart'}
          >
            <div className="h-1 w-10 rounded-full bg-slate-300 mb-3" />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <span className="text-xl">🛒</span>
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semmibold text-slate-900">
                    {cartCount} item{cartCount > 1 ? 's' : ''} in cart
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {expanded ? 'Tap to collapse' : 'Tap to review'}
                  </p>
                </div>
              </div>
              <p className="text-base font-bold text-slate-900 tabular-nums">₹{cartTotal}</p>
            </div>
          </button>

          {/* Expanded item list */}
          {expanded && (
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              {cart.map((ci) => (
                <div
                  key={ci.menuItem.id}
                  className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0"
                >
                  <span className="text-2xl select-none">{ci.menuItem.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {ci.menuItem.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      ₹{ci.menuItem.price} each
                    </p>
                  </div>
                  {/* Stepper */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQty(ci.menuItem.id, -1)}
                      aria-label={`Decrease ${ci.menuItem.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold transition-all duration-150 hover:bg-slate-200 active:scale-95"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-black text-slate-800">
                      {ci.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(ci.menuItem.id, 1)}
                      aria-label={`Increase ${ci.menuItem.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white font-bold transition-all duration-150 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-12 text-right text-sm font-extrabold text-slate-800">
                    ₹{ci.menuItem.price * ci.quantity}
                  </p>
                </div>
              ))}

              {/* Total row */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 mt-2">
                <span className="text-sm font-semibold text-slate-600">
                  Total
                </span>
                <span className="text-lg font-bold text-slate-900 tabular-nums">
                  ₹{cartTotal}
                </span>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="px-5 pb-5 pt-2">
            <button
              onClick={onCheckout}
              className="w-full rounded-2xl bg-indigo-600 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              {expanded ? `Proceed to Checkout — ₹${cartTotal}` : `Checkout — ₹${cartTotal} →`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
