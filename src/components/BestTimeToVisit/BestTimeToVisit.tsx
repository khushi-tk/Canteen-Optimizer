/**
 * components/BestTimeToVisit/BestTimeToVisit.tsx
 *
 * Shows a 24-hour crowd heatmap for the canteen with "best windows"
 * recommendations. Data is mock but follows the same pattern as the
 * rest of the app — in production, replace HOURLY_CROWD_PATTERN with
 * a real API call (e.g. fetchHourlyCrowdForecast()).
 *
 * Design decisions:
 * - Collapsible so it doesn't clutter the home screen by default
 * - Scrollable horizontal bar chart (no external chart lib)
 * - Current hour highlighted with a pulse ring
 * - "Best windows" derived automatically from the data
 */

import { useState, useMemo } from 'react';
import type { CrowdLevel } from '../../types';

/* ── Types ─────────────────────────────────────────────────── */

interface HourSlot {
  hour: number;          // 0–23
  level: CrowdLevel;
  /** Relative busy-ness 0–100 (drives bar height) */
  intensity: number;
  label: string;         // e.g. "8 AM"
}

/* ── Mock data ─────────────────────────────────────────────── */
// Typical college canteen pattern: slow morning, lunch rush 12–2,
// snack peak 4–5, quiet evenings.
const RAW_INTENSITIES: number[] = [
  5,   // 0  Midnight
  2,   // 1
  2,   // 2
  2,   // 3
  3,   // 4
  5,   // 5
  12,  // 6  Early risers
  28,  // 7  Breakfast start
  55,  // 8  Morning rush
  48,  // 9
  35,  // 10
  60,  // 11 Pre-lunch surge
  92,  // 12 Lunch peak
  95,  // 13 Lunch peak (worst)
  78,  // 14 Tail of lunch
  45,  // 15 Quiet afternoon
  72,  // 16 Snack break
  65,  // 17 Late-afternoon
  42,  // 18
  30,  // 19 Evening
  18,  // 20
  12,  // 21
  8,   // 22
  5,   // 23
];

function intensityToLevel(v: number): CrowdLevel {
  if (v < 35) return 'low';
  if (v < 70) return 'medium';
  return 'high';
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

const HOUR_SLOTS: HourSlot[] = RAW_INTENSITIES.map((intensity, hour) => ({
  hour,
  intensity,
  level: intensityToLevel(intensity),
  label: formatHour(hour),
}));

/* ── Helpers ───────────────────────────────────────────────── */

const LEVEL_BAR: Record<CrowdLevel, string> = {
  low: 'bg-emerald-400',
  medium: 'bg-amber-400',
  high: 'bg-red-400',
};

const LEVEL_TEXT: Record<CrowdLevel, string> = {
  low: 'text-emerald-700',
  medium: 'text-amber-700',
  high: 'text-red-700',
};

const LEVEL_BG: Record<CrowdLevel, string> = {
  low: 'bg-emerald-50',
  medium: 'bg-amber-50',
  high: 'bg-red-50',
};

/** Find contiguous low-crowd windows of at least 1 hour. */
function findBestWindows(slots: HourSlot[]): Array<{ start: number; end: number; label: string }> {
  const windows: Array<{ start: number; end: number; label: string }> = [];
  let i = 0;
  while (i < slots.length) {
    if (slots[i].level === 'low') {
      const start = i;
      while (i < slots.length && slots[i].level === 'low') i++;
      const end = i - 1;
      windows.push({
        start,
        end,
        label:
          start === end
            ? formatHour(start)
            : `${formatHour(start)} – ${formatHour(end + 1)}`,
      });
    } else {
      i++;
    }
  }
  // Return up to 3 best windows (fewest people = lowest average intensity)
  return windows
    .sort((a, b) => {
      const avgA =
        slots.slice(a.start, a.end + 1).reduce((s, h) => s + h.intensity, 0) /
        (a.end - a.start + 1);
      const avgB =
        slots.slice(b.start, b.end + 1).reduce((s, h) => s + h.intensity, 0) /
        (b.end - b.start + 1);
      return avgA - avgB;
    })
    .slice(0, 3);
}

/* ── Component ─────────────────────────────────────────────── */

export function BestTimeToVisit() {
  const [open, setOpen] = useState(false);

  const currentHour = new Date().getHours();

  const currentSlot = useMemo(
    () => HOUR_SLOTS[currentHour] ?? HOUR_SLOTS[12],
    [currentHour],
  );

  const bestWindows = useMemo(() => findBestWindows(HOUR_SLOTS), []);

  // Only show hours from 6 AM to 10 PM (canteen operating range)
  const visibleSlots = HOUR_SLOTS.slice(6, 23);

  return (
    <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🕐</span>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">
              Best Time to Visit
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentSlot.level === 'low' && 'Great time to visit right now'}
              {currentSlot.level === 'medium' && 'Moderate crowd right now'}
              {currentSlot.level === 'high' && 'Very busy right now — see quieter times'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Current level chip */}
          <span
            className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${LEVEL_BG[currentSlot.level]} ${LEVEL_TEXT[currentSlot.level]}`}
          >
            {currentSlot.level === 'low' ? 'Quiet Now' : currentSlot.level === 'medium' ? 'Moderate' : 'Busy Now'}
          </span>
          {/* Chevron */}
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="animate-fadeIn border-t border-slate-100 px-5 pb-5 pt-4">
          {/* Best windows */}
          {bestWindows.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                ✨ Recommended Windows
              </p>
              <div className="flex flex-wrap gap-2">
                {bestWindows.map((w) => (
                  <span
                    key={w.label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {w.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Heatmap bar chart */}
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Today's Crowd Forecast
          </p>

          <div className="overflow-x-auto no-scrollbar -mx-1">
            <div className="flex items-end gap-1 px-1 min-w-max">
              {visibleSlots.map((slot) => {
                const isCurrent = slot.hour === currentHour;
                const barH = Math.max(8, Math.round((slot.intensity / 100) * 56));

                return (
                  <div
                    key={slot.hour}
                    className="flex flex-col items-center gap-1"
                    style={{ minWidth: '32px' }}
                  >
                    {/* Bar */}
                    <div className="relative flex items-end" style={{ height: '60px' }}>
                      {isCurrent && (
                        <span
                          className={`absolute inset-0 flex items-end justify-center pointer-events-none`}
                        >
                          <span
                            className={`absolute rounded-sm animate-pulse opacity-30 w-full ${LEVEL_BAR[slot.level]}`}
                            style={{ height: `${barH + 4}px` }}
                          />
                        </span>
                      )}
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${LEVEL_BAR[slot.level]} ${isCurrent ? 'ring-2 ring-offset-1 ring-brand-500' : ''}`}
                        style={{ height: `${barH}px`, width: '28px' }}
                      />
                    </div>

                    {/* Hour label */}
                    <p
                      className={`text-[9px] leading-none font-medium ${
                        isCurrent ? 'text-brand-600 font-bold' : 'text-slate-400'
                      }`}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {slot.hour % 2 === 0 || isCurrent ? slot.label : '·'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 justify-center">
            {(['low', 'medium', 'high'] as CrowdLevel[]).map((lvl) => (
              <div key={lvl} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-sm flex-shrink-0 ${LEVEL_BAR[lvl]}`} />
                <span className="text-[10px] font-medium text-slate-500 capitalize">
                  {lvl === 'low' ? 'Quiet' : lvl === 'medium' ? 'Moderate' : 'Busy'}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border-2 border-brand-500 flex-shrink-0" />
              <span className="text-[10px] font-medium text-slate-500">Now</span>
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] text-slate-400">
            Based on historical patterns · Updates daily
          </p>
        </div>
      )}
    </div>
  );
}
