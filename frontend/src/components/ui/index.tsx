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
}

const SPINNER_SIZE: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${SPINNER_SIZE[size]} rounded-full border-slate-200 border-t-brand-500 animate-spin`}
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
    <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
      <span className="text-lg">⚠️</span>
      <p className="flex-1 text-sm font-semibold text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-xl bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition-all duration-150 hover:bg-red-200 active:scale-95"
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

const DIET_CONFIG: Record<DietaryTag, { dot: string; label: string; bg: string; text: string }> = {
  veg: { dot: 'bg-emerald-500', label: 'Veg', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'non-veg': { dot: 'bg-red-500', label: 'Non-Veg', bg: 'bg-red-50', text: 'text-red-700' },
  vegan: { dot: 'bg-green-500', label: 'Vegan', bg: 'bg-green-50', text: 'text-green-700' },
  'contains-egg': { dot: 'bg-amber-500', label: 'Egg', bg: 'bg-amber-50', text: 'text-amber-700' },
};

export function DietaryBadge({ tag }: DietaryBadgeProps) {
  const cfg = DIET_CONFIG[tag];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[999px] px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ── CategoryPill ──────────────────────────────────────────── */

interface CategoryPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function CategoryPill({ label, active, onClick }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-[999px] px-4 py-2 text-xs font-bold transition-all duration-150 active:scale-95 ${
        active
          ? 'bg-brand-500 text-white shadow-md'
          : 'bg-white text-slate-500 border border-slate-200 hover:border-brand-300 hover:text-brand-600'
      }`}
    >
      {label}
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
      className={`animate-pulse rounded-2xl bg-slate-200 ${className}`}
      aria-hidden="true"
    />
  );
}

/* ── EmptyState ────────────────────────────────────────────── */

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl mb-3">{icon}</span>
      <h3 className="text-base font-extrabold text-slate-700">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      )}
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
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
