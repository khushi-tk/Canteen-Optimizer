/**
 * components/Menu/CartDrawer.tsx
 *
 * Bottom-sheet style cart drawer that sits above the BottomNav.
 * Collapsed state shows item count + total + checkout CTA.
 * Expanded state slides up (max 75vh) with item list, steppers,
 * and a full-width "Proceed to Checkout" button.
 *
 * Hidden entirely when the cart is empty.
 *
 * Props:
 *   cart          — array of CartItems
 *   cartCount     — total item count (derived)
 *   cartTotal     — total price (derived)
 *   onUpdateQty   — stepper callback (id, delta)
 *   onCheckout    — triggers navigation to checkout view
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
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed left-0 right-0 z-[55] mx-auto w-full max-w-[390px]"
        style={{
          bottom: expanded ? 0 : 56,
          height: expanded ? '75vh' : 84,
          transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1), bottom 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex h-full flex-col rounded-t-[20px] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
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
                  <span className="text-xl">🛒</span>
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-extrabold text-slate-800">
                    {cartCount} item{cartCount > 1 ? 's' : ''} in cart
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {expanded ? 'Tap to collapse' : 'Tap to review'}
                  </p>
                </div>
              </div>
              <p className="text-base font-black text-slate-800">₹{cartTotal}</p>
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
                  <span className="text-2xl">{ci.menuItem.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
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
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold transition-all duration-150 active:scale-95"
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
                <span className="text-sm font-extrabold text-slate-600">
                  Total
                </span>
                <span className="text-lg font-black text-slate-800">
                  ₹{cartTotal}
                </span>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="px-5 pb-5 pt-2">
            <button
              onClick={onCheckout}
              className="w-full rounded-2xl bg-brand-500 py-3.5 text-center text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(249,115,22,0.35)] transition-all duration-150 hover:bg-brand-600 active:scale-[0.98]"
            >
              {expanded ? `Proceed to Checkout — ₹${cartTotal}` : `Checkout — ₹${cartTotal} →`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
