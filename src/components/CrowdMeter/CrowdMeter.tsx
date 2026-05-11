/**
 * components/CrowdMeter/CrowdMeter.tsx
 *
 * Professional crowd-level gauge for CanteenCrowd. Semi-circular arc
 * with smooth transitions, live capacity indicators, and contextual
 * guidance. Optimized for at-a-glance decision making.
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
    bg: 'bg-emerald-50/80',
    accent: 'text-emerald-700',
    stroke: '#10b981',
    label: 'Low Crowd',
    description: 'Walk right in — no queue expected.',
    fillPercent: 0.25,
  },
  medium: {
    bg: 'bg-amber-50/80',
    accent: 'text-amber-700',
    stroke: '#f59e0b',
    label: 'Moderate',
    description: 'Short wait likely. Order ahead to skip the line.',
    fillPercent: 0.55,
  },
  high: {
    bg: 'bg-red-50/80',
    accent: 'text-red-700',
    stroke: '#ef4444',
    label: 'Very Busy',
    description: 'Canteen is at capacity. Strongly recommend ordering ahead.',
    fillPercent: 0.9,
  },
};

/* ── Arc constants ─────────────────────────────────────────── */

const ARC_RADIUS = 80;
const ARC_STROKE = 12;
const ARC_CIRCUMFERENCE = Math.PI * ARC_RADIUS;

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
      hour12: true,
    });
  }, [data]);

  /* Loading skeleton */
  if (isLoading || !data) {
    return (
      <div className="rounded-xl bg-white p-5 border border-slate-100 shadow-sm">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-[110px] w-full mb-4" />
        <Skeleton className="h-4 w-48 mx-auto mb-3" />
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl p-5 border border-slate-100 shadow-sm transition-colors duration-500 ${cfg.bg}`}
    >
      {/* Header row: override badge + refresh */}
      <div className="flex items-center justify-between mb-1">
        {data.manualOverride ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-semibold text-white">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            Manual Override
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-emerald-500" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        )}

        <button
          onClick={refresh}
          aria-label="Refresh crowd status"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 transition-all duration-150 hover:bg-slate-50 hover:text-slate-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* SVG Arc Gauge */}
      <div className="flex flex-col items-center pt-2">
        <svg
          width="200"
          height="110"
          viewBox="0 0 200 110"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          {/* Track */}
          <path
            d={`M ${100 - ARC_RADIUS} 100 A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${100 + ARC_RADIUS} 100`}
            fill="none"
            stroke="url(#trackGradient)"
            strokeWidth={ARC_STROKE}
            strokeLinecap="round"
          />

          {/* Fill */}
          <path
            d={`M ${100 - ARC_RADIUS} 100 A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${100 + ARC_RADIUS} 100`}
            fill="none"
            stroke={cfg.stroke}
            strokeWidth={ARC_STROKE}
            strokeLinecap="round"
            strokeDasharray={ARC_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
            }}
          />

          {/* Tick marks */}
          {[0, 0.33, 0.66, 1].map((pos) => {
            const angle = Math.PI * (1 - pos);
            const x1 = 100 + (ARC_RADIUS - 6) * Math.cos(angle);
            const y1 = 100 - (ARC_RADIUS - 6) * Math.sin(angle);
            const x2 = 100 + (ARC_RADIUS + 6) * Math.cos(angle);
            const y2 = 100 - (ARC_RADIUS + 6) * Math.sin(angle);
            return (
              <line
                key={pos}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#cbd5e1"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Level label */}
        <p
          className={`-mt-2 text-2xl font-bold tracking-tight ${cfg.accent}`}
        >
          {cfg.label}
        </p>
      </div>

      {/* Wait time pill */}
      {data.estimatedWaitMinutes > 0 && (
        <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-white/80 border border-slate-200/60 px-3.5 py-1.5 backdrop-blur-sm">
          <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-semibold text-slate-700">
            ~{data.estimatedWaitMinutes} min wait
          </span>
        </div>
      )}

      {/* Description */}
      <p className="mt-3 text-center text-xs font-medium text-slate-600 leading-relaxed max-w-[260px] mx-auto">
        {cfg.description}
      </p>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-3 text-center">
        <div className="rounded-lg bg-white/60 py-2">
          <p className="text-lg font-bold text-slate-900 tabular-nums">
            {data.preparingOrderCount}
          </p>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
            Preparing
          </p>
        </div>
        <div className="rounded-lg bg-white/60 py-2">
          <p className="text-lg font-bold text-slate-900 tabular-nums">
            {data.staffOnDuty}
          </p>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
            Staff On Duty
          </p>
        </div>
        <div className="rounded-lg bg-white/60 py-2">
          <p className="text-lg font-bold text-slate-900 tabular-nums">
            {lastUpdatedLabel}
          </p>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
            Last Updated
          </p>
        </div>
      </div>
    </div>
  );
}