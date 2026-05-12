/**
 * components/ui/index.tsx
 *
 * Shared presentational atoms used across the app: Spinner, ErrorBanner,
 * DietaryBadge, CategoryPill, Skeleton, EmptyState, SectionHeader.
 * All components are typed with explicit Props interfaces.
 */

import React from 'react';
import type { DietaryTag } from '../../types';

/* ── Spinner ───────────────────────────────────────────────── */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'neutral';
}

const SPINNER_SIZE: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2[2.5px]',
  lg: 'h-8 w-8 border-[3px]',
};

const SPINNER_VARIANT: Record<NonNullable<SpinnerProps['variant']>, string> = {
  primary: 'border-slate-200 border-t-indigo-600',
  neutral: 'border-slate-200 border-t-slate-500',
};

export function Spinner({ size = 'md', variant = "primary" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${SPINNER_SIZE[size]} ${SPINNER_VARIANT[variant]} rounded-full animate-spin`}
    />
  );
}

/* ── ErrorBanner ───────────────────────────────────────────── */

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
       <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-red-800">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/* ── DietaryBadge ──────────────────────────────────────────── */

interface DietaryBadgeProps {
  tag: DietaryTag;
}

const DIET_CONFIG: Record<
DietaryTag, 
{ icon: string; label: string; bg: string; text: string; border: string }
> = {
  veg: 
  { icon: '🌿', 
    label: 'Veg', 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700',
    border: 'border-emerald-200' ,
  },
  'non-veg': 
  { icon: '🍗', 
    label: 'Non-Veg', 
    bg: 'bg-rose-50', 
    text: 'text-rose-700',
     border: 'border-rose-200',
  },
  vegan: 
  { icon: '🌱', 
    label: 'Vegan', 
    bg: 'bg-green-50', 
    text: 'text-green-700',
    border: 'border-green-200',
  },
  'contains-egg': 
  { icon: '🥚', 
    label: 'Egg', 
    bg: 'bg-amber-50', 
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
};

export function DietaryBadge({ tag }: DietaryBadgeProps) {
  const cfg = DIET_CONFIG[tag];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className="text-[10px]" aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

/* ── CategoryPill ──────────────────────────────────────────── */

interface CategoryPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

export function CategoryPill({ label, active, onClick, count }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
       className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
        active
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-brandr-slate-300 hover:bg-slate-50'
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ── Skeleton ──────────────────────────────────────────────── */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
      aria-hidden="true"
    />
  );
}

/* ── EmptyState ────────────────────────────────────────────── */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {subtitle && (
        <p className="mt-1 max-w-xs text-sm text-slate-500 leading-relaxed">{subtitle}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── SectionHeader ─────────────────────────────────────────── */

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}/* ── CrowdIndicator (new — app-specific) ───────────────────── */
interface CrowdIndicatorProps {
  level: 'low' | 'moderate' | 'high' | 'critical';
  percentage?: number;
  label?: string;
}
const CROWD_CONFIG: Record<
  CrowdIndicatorProps['level'],
  { color: string; bg: string; text: string; label: string }
> = {
  low: {
    color: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    label: 'Low Crowd',
  },
  moderate: {
    color: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    label: 'Moderate',
  },
  high: {
    color: 'bg-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    label: 'High Crowd',
  },
  critical: {
    color: 'bg-red-500',
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'Very Busy',
  },
};
export function CrowdIndicator({ level, percentage, label }: CrowdIndicatorProps) {
  const cfg = CROWD_CONFIG[level];
  const displayLabel = label || cfg.label;
  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 ${cfg.bg} border-current/10`}>
      <span className={`relative flex h-2.5 w-2.5`}>
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${cfg.color}`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${cfg.color}`} />
      </span>
      <span className={`text-sm font-semibold ${cfg.text}`}>{displayLabel}</span>
      {percentage !== undefined && (
        <span className={`text-xs font-medium ${cfg.text} opacity-75`}>
          {percentage}%
        </span>
      )}
    </div>
  );
}
/* ── CapacityBar (new — app-specific) ──────────────────────── */
interface CapacityBarProps {
  current: number;
  max: number;
  label?: string;
}
export function CapacityBar({ current, max, label }: CapacityBarProps) {
  const percentage = Math.min(100, Math.round((current / max) * 100));
  let barColor = 'bg-emerald-500';
  if (percentage > 85) barColor = 'bg-red-500';
  else if (percentage > 60) barColor = 'bg-amber-500';
  else if (percentage > 40) barColor = 'bg-blue-500';
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{label}</span>
          <span className="font-semibold text-slate-900">{current} / {max}</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`Capacity: ${percentage}%`}
        />
      </div>
    </div>
  );
}
