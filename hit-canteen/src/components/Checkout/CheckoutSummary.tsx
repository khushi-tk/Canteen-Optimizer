/**
 * components/Checkout/CheckoutSummary.tsx
 *
 * Full-screen checkout view with:
 *  1. Sticky header (back arrow + title)
 *  2. Order items card
 *  3. TimeSlotPicker
 *  4. Selected slot confirmation pill
 *  5. Error banner (if any)
 *  6. Fixed bottom CTA (disabled until slot selected)
 *
 * Props:
 *   cart, cartTotal        — from useMenu
 *   slots, slotsLoading,
 *   selectedSlotId,
 *   selectSlot             — from useOrder
 *   isPlacingOrder,
 *   orderError             — submission state
 *   onPlaceOrder           — triggers submitOrder
 *   onBack                 — navigates back to menu
 */

import type { CartItem, TimeSlot } from '../../types';
import { ErrorBanner, SectionHeader, Spinner } from '../ui';
import { TimeSlotPicker } from './TimeSlotPicker';

interface CheckoutSummaryProps {
  cart: CartItem[];
  cartTotal: number;
  slots: TimeSlot[];
  slotsLoading: boolean;
  selectedSlotId: string | null;
  selectSlot: (id: string) => void;
  isPlacingOrder: boolean;
  orderError: string | null;
  onPlaceOrder: () => void;
  onBack: () => void;
}

export function CheckoutSummary({
  cart,
  cartTotal,
  slots,
  slotsLoading,
  selectedSlotId,
  selectSlot,
  isPlacingOrder,
  orderError,
  onPlaceOrder,
  onBack,
}: CheckoutSummaryProps) {
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const canPlace = !!selectedSlotId && !isPlacingOrder;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-white/80 px-5 py-4 backdrop-blur-md border-b border-slate-100">
        <button
          onClick={onBack}
          aria-label="Go back to menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-150 hover:bg-slate-200 active:scale-95"
        >
          ←
        </button>
        <h1 className="text-lg font-extrabold text-slate-800">Checkout</h1>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-32">
        {/* Order items card */}
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <SectionHeader title="Your Order" subtitle={`${cart.length} item${cart.length > 1 ? 's' : ''}`} />
          {cart.map((ci, idx) => (
            <div
              key={ci.menuItem.id}
              className={`flex items-center gap-3 py-2.5 ${
                idx < cart.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <span className="text-xl">{ci.menuItem.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {ci.menuItem.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  ₹{ci.menuItem.price} × {ci.quantity}
                </p>
              </div>
              <p className="text-sm font-extrabold text-slate-800">
                ₹{ci.menuItem.price * ci.quantity}
              </p>
            </div>
          ))}
          {/* Total */}
          <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
            <span className="text-sm font-extrabold text-slate-600">Total</span>
            <span className="text-lg font-black text-slate-800">₹{cartTotal}</span>
          </div>
        </div>

        {/* Time slot picker */}
        <div className="mt-5">
          <SectionHeader
            title="Pick Your Slot"
            subtitle="Choose a pickup window"
          />
          <TimeSlotPicker
            slots={slots}
            isLoading={slotsLoading}
            selectedSlotId={selectedSlotId}
            onSelect={selectSlot}
          />
        </div>

        {/* Selected slot confirmation pill */}
        {selectedSlot && (
          <div className="mt-4 flex items-center gap-2 rounded-[999px] bg-brand-50 px-4 py-2.5">
            <span className="text-lg">📅</span>
            <span className="text-sm font-black text-brand-700">
              {selectedSlot.label}
            </span>
          </div>
        )}

        {/* Error */}
        {orderError && (
          <div className="mt-4">
            <ErrorBanner message={orderError} />
          </div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto w-full max-w-[390px] bg-white/90 px-5 pb-6 pt-3 backdrop-blur-md border-t border-slate-100">
        {!selectedSlotId && (
          <p className="mb-2 text-center text-xs font-semibold text-slate-400">
            Select a pickup slot to continue
          </p>
        )}
        <button
          onClick={onPlaceOrder}
          disabled={!canPlace}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold transition-all duration-200 active:scale-[0.98] ${
            canPlace
              ? 'bg-brand-500 text-white shadow-[0_8px_24px_rgba(249,115,22,0.35)] hover:bg-brand-600'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isPlacingOrder ? (
            <>
              <Spinner size="sm" />
              <span>Placing Order…</span>
            </>
          ) : (
            `Place Order — ₹${cartTotal}`
          )}
        </button>
      </div>
    </div>
  );
}
