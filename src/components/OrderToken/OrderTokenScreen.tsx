/**
 * components/OrderToken/OrderTokenScreen.tsx
 *
 * Full-screen confirmation page shown after successful order placement.
 * Features:
 *  - Animated header with 🎉 bounce
 *  - Token code banner (monospace, slate-800 bg)
 *  - QR code from qrserver.com with fallback
 *  - Live countdown timer to estimated ready time
 *  - 4-step status tracker with connector lines
 *  - Order summary accordion
 *  - "Back to Menu" button
 *
 * Props:
 *   token   — the confirmed OrderToken
 *   onDone  — callback to return to the menu
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OrderStatus, OrderToken } from '../../types';

interface OrderTokenScreenProps {
  token: OrderToken;
  onDone: () => void;
}

/* ── Status tracker config ─────────────────────────────────── */

interface TrackerStep {
  key: OrderStatus;
  emoji: string;
  label: string;
}

const STEPS: TrackerStep[] = [
  { key: 'confirmed', emoji: '✅', label: 'Confirmed' },
  { key: 'preparing', emoji: '👨‍🍳', label: 'Preparing' },
  { key: 'ready', emoji: '🔔', label: 'Ready' },
  { key: 'picked_up', emoji: '🎉', label: 'Picked Up' },
];

const STATUS_ORDER: OrderStatus[] = [
  'pending_payment',
  'confirmed',
  'preparing',
  'ready',
  'picked_up',
];

function getStepState(
  stepKey: OrderStatus,
  currentStatus: OrderStatus,
): 'completed' | 'current' | 'future' {
  const stepIdx = STATUS_ORDER.indexOf(stepKey);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'current';
  return 'future';
}

/* ── Countdown helper ──────────────────────────────────────── */

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Ready now!';
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

/* ── Component ─────────────────────────────────────────────── */

export function OrderTokenScreen({ token, onDone }: OrderTokenScreenProps) {
  const [qrError, setQrError] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);
  const [summaryOpen, setSummaryOpen] = useState(false);

  /* Live countdown */
  const readyTime = useMemo(() => new Date(token.estimatedReadyAt).getTime(), [token.estimatedReadyAt]);

  const updateRemaining = useCallback(() => {
    setRemaining(Math.max(0, readyTime - Date.now()));
  }, [readyTime]);

  useEffect(() => {
    updateRemaining();
    const id = setInterval(updateRemaining, 1000);
    return () => clearInterval(id);
  }, [updateRemaining]);

  /* Ready time display */
  const readyTimeLabel = useMemo(() => {
    const d = new Date(token.estimatedReadyAt);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [token.estimatedReadyAt]);

  /* QR URL */
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    token.qrPayload,
  )}&size=180x180&margin=8&qzone=2`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Orange header */}
      <div className="bg-brand-500 dark:bg-brand-600 px-5 pt-10 pb-16 text-center">
        <span className="inline-block text-5xl animate-bounce">🎉</span>
        <h1 className="mt-2 text-2xl font-black text-white">Order Confirmed!</h1>
        <p className="mt-1 text-sm font-semibold text-brand-100 dark:text-brand-200">
          Your food is being prepared
        </p>
      </div>

      {/* Main card */}
      <div className="mx-5 -mt-8 rounded-[20px] bg-white dark:bg-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        {/* Token banner */}
        <div className="flex items-center justify-between rounded-t-[20px] bg-slate-800 dark:bg-slate-900 px-5 py-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Order Token
            </p>
            <p className="mt-0.5 font-mono text-[26px] font-black tracking-widest text-white">
              {token.tokenCode}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Pickup
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-brand-400 dark:text-brand-300">
              {token.pickupSlot.label}
            </p>
          </div>
        </div>

        {/* QR code section */}
        <div className="flex flex-col items-center py-6">
          <div className="rounded-2xl border-4 border-white dark:border-slate-700 bg-white dark:bg-slate-700 p-1 shadow-md">
            {qrError ? (
              <div className="flex h-[180px] w-[180px] flex-col items-center justify-center text-center">
                <span className="text-4xl">📱</span>
                <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                  QR Code (loads with internet)
                </p>
              </div>
            ) : (
              <img
                src={qrUrl}
                alt={`QR code for order ${token.tokenCode}`}
                width={180}
                height={180}
                className="rounded-xl"
                onError={() => setQrError(true)}
              />
            )}
          </div>
          <span className="mt-3 rounded-[999px] bg-brand-500 dark:bg-brand-600 px-4 py-1.5 text-xs font-bold text-white">
            Scan at counter
          </span>
          <p className="mt-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Show this QR code at the counter
          </p>
        </div>
      </div>

      {/* Countdown card */}
      <div className="mx-5 mt-4 flex items-center justify-between rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            Estimated Ready At
          </p>
          <p className="text-lg font-black text-slate-800 dark:text-slate-100">{readyTimeLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            Time Remaining
          </p>
          <p className={`text-lg font-black ${remaining > 0 ? 'text-brand-500 dark:text-brand-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
            {formatCountdown(remaining)}
          </p>
        </div>
      </div>

      {/* Status tracker */}
      <div className="mx-5 mt-4 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-4">Order Status</p>
        <div className="relative flex items-start justify-between">
          {/* Connector line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700" />
          <div
            className="absolute top-4 left-4 h-0.5 bg-emerald-400 transition-all duration-500"
            style={{
              width: `${(STATUS_ORDER.indexOf(token.status) / (STEPS.length - 1)) * 100
                }%`,
              maxWidth: 'calc(100% - 32px)',
            }}
          />

          {STEPS.map((step) => {
            const state = getStepState(step.key, token.status);
            return (
              <div
                key={step.key}
                className="relative z-10 flex flex-col items-center"
                style={{ width: `${100 / STEPS.length}%` }}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-300 ${state === 'current'
                      ? 'bg-brand-500 dark:bg-brand-600 text-white scale-110 shadow-[0_0_12px_rgba(249,115,22,0.5)]'
                      : state === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                >
                  {step.emoji}
                </div>
                <p
                  className={`mt-1.5 text-center text-[9px] font-bold leading-tight ${state === 'current'
                      ? 'text-brand-600 dark:text-brand-400'
                      : state === 'completed'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order summary accordion */}
      <div className="mx-5 mt-4 rounded-2xl bg-white dark:bg-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-hidden">
        <button
          onClick={() => setSummaryOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
        >
          <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
            Order Summary
          </span>
          <span
            className="text-slate-400 dark:text-slate-500 transition-transform duration-200"
            style={{ transform: summaryOpen ? 'rotate(180deg)' : undefined }}
          >
            ▾
          </span>
        </button>
        {summaryOpen && (
          <div className="border-t border-slate-100 dark:border-slate-700 px-4 pb-3">
            {token.items.map((ci) => (
              <div
                key={ci.menuItem.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-slate-700 dark:text-slate-300">
                  {ci.menuItem.emoji} {ci.menuItem.name} × {ci.quantity}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{ci.menuItem.price * ci.quantity}
                </span>
              </div>
            ))}
            <div className="mt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-2 text-sm font-black text-slate-800 dark:text-slate-100">
              <span>Total Paid</span>
              <span>₹{token.totalAmount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Back to menu */}
      <div className="px-5 pt-5 pb-10">
        <button
          onClick={onDone}
          className="w-full rounded-2xl bg-slate-800 dark:bg-slate-700 py-3.5 text-sm font-extrabold text-white transition-all duration-150 hover:bg-slate-700 dark:hover:bg-slate-600 active:scale-[0.98]"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}