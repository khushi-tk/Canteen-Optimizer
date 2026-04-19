/**
 * hooks/useToast.ts
 *
 * Context-based toast notification system.
 *
 * Wrap the app in <ToastProvider> and call `useToast()` anywhere to get
 * `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`.
 *
 * Toasts auto-dismiss after 3500 ms, support an optional detail subtitle,
 * slide in from the right, and cap at 3 visible toasts (oldest removed).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

/* ── Types ─────────────────────────────────────────────────── */

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
  detail?: string;
  exiting?: boolean;
}

interface ToastMethods {
  success: (message: string, detail?: string) => void;
  error: (message: string, detail?: string) => void;
  warning: (message: string, detail?: string) => void;
  info: (message: string, detail?: string) => void;
}

interface ToastContextValue {
  toast: ToastMethods;
}

/* ── Context ───────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

/* ── Variant config ────────────────────────────────────────── */

const VARIANT_STYLES: Record<ToastVariant, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-emerald-50', border: 'border-emerald-400', icon: '✅' },
  error: { bg: 'bg-red-50', border: 'border-red-400', icon: '❌' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-400', icon: '⚠️' },
  info: { bg: 'bg-blue-50', border: 'border-blue-400', icon: 'ℹ️' },
};

/* ── Provider ──────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string, detail?: string) => {
      const id = ++idRef.current;
      setToasts((prev) => {
        const next = [...prev, { id, variant, message, detail }];
        // Cap at 3
        if (next.length > 3) {
          const oldest = next[0];
          setTimeout(() => dismiss(oldest.id), 0);
        }
        return next.slice(-3);
      });
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const toast: ToastMethods = {
    success: (m, d) => push('success', m, d),
    error: (m, d) => push('error', m, d),
    warning: (m, d) => push('warning', m, d),
    info: (m, d) => push('info', m, d),
  };

  return React.createElement(
    ToastContext.Provider,
    { value: { toast } },
    children,
    /* Toast container */
    React.createElement(
      'div',
      {
        className: 'fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none',
        style: { maxWidth: 340 },
      },
      toasts.map((t) => {
        const v = VARIANT_STYLES[t.variant];
        return React.createElement(
          'div',
          {
            key: t.id,
            className: `pointer-events-auto flex items-start gap-2 px-4 py-3 rounded-2xl border shadow-lg ${v.bg} ${v.border} ${
              t.exiting ? 'animate-toastOut' : 'animate-toastIn'
            }`,
          },
          React.createElement('span', { className: 'text-lg flex-shrink-0 mt-0.5' }, v.icon),
          React.createElement(
            'div',
            { className: 'flex-1 min-w-0' },
            React.createElement(
              'p',
              { className: 'text-sm font-bold text-slate-800 leading-tight' },
              t.message,
            ),
            t.detail &&
              React.createElement(
                'p',
                { className: 'text-xs text-slate-500 mt-0.5 leading-tight' },
                t.detail,
              ),
          ),
          React.createElement(
            'button',
            {
              'aria-label': 'Dismiss notification',
              className:
                'flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none mt-0.5',
              onClick: () => dismiss(t.id),
            },
            '×',
          ),
        );
      }),
    ),
  );
}

/* ── Hook ──────────────────────────────────────────────────── */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
