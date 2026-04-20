/**
 * components/CrowdMeter/CrowdMeter.tsx
 *
 * Animated half-circle gauge showing the canteen's current crowd level.
 * Background, arc fill color, and labels change dynamically with the
 * CrowdLevel. Includes a stats row (preparing orders, staff, last update),
 * optional manual-override badge, and a refresh button.
 *
 * Props:
 *   crowdStatus? — if provided, uses this data and disables internal fetch.
 */

import { useMemo } from 'react';
import type { CrowdLevel, CrowdStatus } from '../../types';
import { useCrowdStatus } from '../../hooks/useCrowdStatus';
import { Skeleton } from '../ui';

/* ── Level config ──────────────────────────────────────────── */

interface LevelConfig {
  bg: string;
  accent: string;
  stroke: string;
  label: string;
  description: string;
  fillPercent: number;
}

const LEVEL_MAP: Record<CrowdLevel, LevelConfig> = {
  low: {
    bg: 'bg-emerald-50',
    accent: 'text-emerald-600',
    stroke: '#059669',
    label: 'Low',
    description: 'Great time to visit! Minimal queue expected.',
    fillPercent: 0.22,
  },
  medium: {
    bg: 'bg-amber-50',
    accent: 'text-amber-500',
    stroke: '#F59E0B',
    label: 'Medium',
    description: 'Moderate crowd — a short wait is likely.',
    fillPercent: 0.58,
  },
  high: {
    bg: 'bg-red-50',
    accent: 'text-red-500',
    stroke: '#EF4444',
    label: 'High',
    description: 'Canteen is packed. Consider ordering ahead.',
    fillPercent: 0.92,
  },
};

/* ── Arc constants ─────────────────────────────────────────── */

const ARC_RADIUS = 70;
const ARC_STROKE = 10;
const ARC_CIRCUMFERENCE = Math.PI * ARC_RADIUS; // half-circle

/* ── Component ─────────────────────────────────────────────── */

interface CrowdMeterProps {
  crowdStatus?: CrowdStatus;
}

export function CrowdMeter({ crowdStatus: externalData }: CrowdMeterProps) {
  const internal = useCrowdStatus();
  const data = externalData ?? internal.data;
  const isLoading = externalData ? false : internal.isLoading;
  const refresh = internal.refresh;

  const cfg = useMemo(
    () => (data ? LEVEL_MAP[data.level] : LEVEL_MAP.medium),
    [data],
  );

  const dashOffset = useMemo(
    () => ARC_CIRCUMFERENCE * (1 - (data ? LEVEL_MAP[data.level].fillPercent : 0)),
    [data],
  );

  const lastUpdatedLabel = useMemo(() => {
    if (!data) return '';
    const d = new Date(data.lastUpdatedAt);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [data]);

  /* Loading skeleton */
  if (isLoading || !data) {
    return (
      <div className="rounded-[20px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-[100px] w-full mb-4" />
        <Skeleton className="h-4 w-48 mx-auto mb-3" />
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors duration-500 ${cfg.bg}`}
    >
      {/* Manual override badge */}
      {data.manualOverride && (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-[999px] bg-brand-500 px-2.5 py-1 text-[10px] font-bold text-white">
          ⚡ Manager Override
        </span>
      )}

      {/* Refresh button */}
      <button
        onClick={refresh}
        aria-label="Refresh crowd status"
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-sm transition-all duration-150 hover:bg-white active:scale-95"
      >
        ↻
      </button>

      {/* SVG Arc Gauge */}
      <div className="flex flex-col items-center pt-2 pb-1">
        <svg
          width="180"
          height="100"
          viewBox="0 0 180 100"
          className="overflow-visible"
        >
          {/* Track */}
          <path
            d={`M ${90 - ARC_RADIUS} 90 A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${90 + ARC_RADIUS} 90`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth={ARC_STROKE}
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d={`M ${90 - ARC_RADIUS} 90 A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${90 + ARC_RADIUS} 90`}
            fill="none"
            stroke={cfg.stroke}
            strokeWidth={ARC_STROKE}
            strokeLinecap="round"
            strokeDasharray={ARC_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.5s',
            }}
          />
        </svg>

        {/* Level label */}
        <p
          className={`-mt-3 text-[28px] font-black ${cfg.accent}`}
          style={{ lineHeight: 1 }}
        >
          {cfg.label}
        </p>
      </div>

      {/* Wait time pill */}
      {data.estimatedWaitMinutes > 0 && (
        <div className="mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-[999px] bg-white/70 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-sm">🕐</span>
          <span className="text-xs font-bold text-slate-600">
            ~{data.estimatedWaitMinutes} min estimated wait
          </span>
        </div>
      )}

      {/* Description */}
      <p className={`mt-2 text-center text-xs font-semibold ${cfg.accent}`}>
        {cfg.description}
      </p>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/5 pt-3 text-center">
        <div>
          <p className="text-lg font-black text-slate-800">
            {data.preparingOrderCount}
          </p>
          <p className="text-[10px] font-semibold text-slate-400">
            Preparing
          </p>
        </div>
        <div>
          <p className="text-lg font-black text-slate-800">
            {data.staffOnDuty}
          </p>
          <p className="text-[10px] font-semibold text-slate-400">
            Staff On Duty
          </p>
        </div>
        <div>
          <p className="text-lg font-black text-slate-800">
            {lastUpdatedLabel}
          </p>
          <p className="text-[10px] font-semibold text-slate-400">
            Last Updated
          </p>
        </div>
      </div>
    </div>
  );
}
