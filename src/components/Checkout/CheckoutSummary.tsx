/**
 * components/Checkout/CheckoutSummary.tsx
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
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white/90 px-5 py-4 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back to menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-150 hover:bg-slate-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">Checkout</h1>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-32">
        {/* Order items card */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <SectionHeader
            title="Your Order"
            subtitle={`${cart.length} item${cart.length > 1 ? 's' : ''}`}
          />
          {cart.map((ci, idx) => (
            <div
              key={ci.menuItem.id}
              className={`flex items-center gap-3 py-2.5 ${
                idx < cart.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <span className="select-none text-xl">{ci.menuItem.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {ci.menuItem.name}
                </p>
                <p className="text-xs text-slate-500">
                  ₹{ci.menuItem.price} × {ci.quantity}
                </p>
              </div>
              <p className="text-sm font-bold text-slate-900 tabular-nums">
                ₹{ci.menuItem.price * ci.quantity}
              </p>
            </div>
          ))}
          {/* Total */}
          <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
            <span className="text-sm font-semibold text-slate-600">Total</span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">₹{cartTotal}</span>
          </div>
        </div>

        {/* Time slot picker */}
        <div className="mt-5">
          <SectionHeader title="Pick Your Slot" subtitle="Choose a pickup window" />
          <TimeSlotPicker
            slots={slots}
            isLoading={slotsLoading}
            selectedSlotId={selectedSlotId}
            onSelect={selectSlot}
          />
        </div>

        {/* Selected slot confirmation pill */}
        {selectedSlot && (
          <div className="mt-4 flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2.5">
            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <span className="text-sm font-semibold text-indigo-700">
              {selectedSlot.startTime} – {selectedSlot.endTime}
            </span>
          </div>
        )}

        {/* Error */}
        {orderError && (
          <div className="mt-4">
            <ErrorBanner message={orderError} onRetry={onPlaceOrder} />
          </div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto w-full max-w-[390px] border-t border-slate-100 bg-white/95 px-5 pb-6 pt-3 backdrop-blur-md">
        {!selectedSlotId && (
          <p className="mb-2 text-center text-xs font-medium text-slate-400">
            Select a pickup slot to continue
          </p>
        )}
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={!canPlace}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
            canPlace
              ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]'
              : 'cursor-not-allowed bg-slate-200 text-slate-400'
          }`}
        >
          {isPlacingOrder ? (
            <>
              <Spinner size="sm" variant="neutral" />
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