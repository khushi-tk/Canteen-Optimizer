/**
 * components/BottomNav.tsx
 *
 * Fixed bottom tab bar with two tabs: Menu (home) and My Orders.
 * Hidden on "checkout" and "confirmation" views.
 * Active tab shows an orange icon/label and a 4px dot indicator.
 * My Orders tab shows a red badge when activeOrderCount > 0.
 *
 * Props:
 *   currentView      — current AppView state
 *   activeOrderCount — number of currently active orders
 *   onNavigate       — callback to change view
 */

import type { AppView } from '../types';

interface BottomNavProps {
  currentView: AppView;
  activeOrderCount: number;
  onNavigate: (view: AppView) => void;
}

interface TabConfig {
  view: AppView;
  emoji: string;
  label: string;
}

const TABS: TabConfig[] = [
  { view: 'home', emoji: '🏠', label: 'Menu' },
  { view: 'my-orders', emoji: '📦', label: 'My Orders' },
];

export function BottomNav({
  currentView,
  activeOrderCount,
  onNavigate,
}: BottomNavProps) {
  // Hidden on checkout & confirmation views
  if (currentView === 'checkout' || currentView === 'confirmation') {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[390px] border-t border-slate-100 bg-white/90 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = currentView === tab.view;
          return (
            <button
              key={tab.view}
              onClick={() => onNavigate(tab.view)}
              aria-label={`Navigate to ${tab.label}`}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-all duration-150 active:scale-95 ${
                isActive ? 'text-brand-500' : 'text-slate-400'
              }`}
              style={{ minHeight: 44 }}
            >
              <div className="relative">
                <span className="text-xl">{tab.emoji}</span>
                {/* Badge on My Orders */}
                {tab.view === 'my-orders' && activeOrderCount > 0 && (
                  <span className="absolute -top-1 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                    {activeOrderCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">{tab.label}</span>
              {/* Active dot */}
              {isActive && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
