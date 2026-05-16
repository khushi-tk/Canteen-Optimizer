/**
 * components/Menu/CartDrawer.tsx
 *
 * Bottom-sheet cart drawer. Shows a summary bar when collapsed,
 * full item list when expanded, and a single "Proceed to Checkout"
 * CTA. Time-slot selection is handled on the dedicated Checkout page.
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
          height: expanded ? '70vh' : 80,
          transition:
            'height 300ms cubic-bezier(0.4, 0, 0.2, 1), bottom 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex h-full flex-col rounded-t-2xl border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {/* Header */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex w-full flex-col items-center px-5 pt-3 pb-2 transition-colors active:bg-slate-50"
            aria-label={
              expanded ? 'Collapse cart' : 'Expand cart'
            }
          >
            <div className="mb-3 h-1 w-10 rounded-full bg-slate-300" />

            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="text-2xl">🛒</span>

                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                </div>

                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">
                    {cartCount} item
                    {cartCount > 1 ? 's' : ''} in cart
                  </p>

                  <p className="text-[10px] font-medium text-slate-400">
                    {expanded
                      ? 'Tap to collapse'
                      : 'Tap to review'}
                  </p>
                </div>
              </div>

              <p className="text-base font-bold tabular-nums text-slate-900">
                ₹{cartTotal}
              </p>
            </div>
          </button>

          {/* Expanded content */}
          {expanded && (
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              {/* Cart items */}
              {cart.map((ci) => (
                <div
                  key={ci.menuItem.id}
                  className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0"
                >
                  <span className="select-none text-2xl">
                    {ci.menuItem.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {ci.menuItem.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      ₹{ci.menuItem.price} each
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQty(ci.menuItem.id, -1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 transition-all duration-150 hover:bg-slate-200 active:scale-95"
                    >
                      −
                    </button>

                    <span className="w-5 text-center text-sm font-black text-slate-800">
                      {ci.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQty(ci.menuItem.id, 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 font-bold text-white transition-all duration-150 active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  <p className="w-12 text-right text-sm font-extrabold text-slate-800">
                    ₹
                    {ci.menuItem.price * ci.quantity}
                  </p>
                </div>
              ))}

              {/* Total */}
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-600">
                  Total
                </span>

                <span className="text-lg font-bold tabular-nums text-slate-900">
                  ₹{cartTotal}
                </span>
              </div>
            </div>
          )}

          {/* Checkout button */}
          <div className="px-5 pb-5 pt-3">
            <button
              type="button"
              onClick={() => {
                if (!expanded) {
                  setExpanded(true);
                } else {
                  onCheckout();
                }
              }}
              className="w-full rounded-2xl bg-indigo-600 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              {!expanded
                ? `Review & Checkout — ₹${cartTotal} →`
                : `Proceed to Checkout — ₹${cartTotal}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}