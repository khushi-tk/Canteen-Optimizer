/**
 * components/HomeView.tsx
 *
 * The main home screen that combines the CrowdMeter and MenuGrid
 * together in a scrollable view. Owns no state — everything is
 * received via props from App.tsx.
 */

import type { CartItem, MenuItem } from '../types';
import { CrowdMeter } from './CrowdMeter/CrowdMeter';
import { MenuGrid } from './Menu/MenuGrid';
import { CartDrawer } from './Menu/CartDrawer';
import { SectionHeader } from './ui';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  menuItems: MenuItem[];
  menuLoading: boolean;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  onAdd: (item: MenuItem) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: () => void;
}

export function HomeView({
  menuItems,
  menuLoading,
  cart,
  cartCount,
  cartTotal,
  onAdd,
  onUpdateQty,
  onCheckout,
}: HomeViewProps) {
  const { logout } = useAuth();

  return (
    <div className="pb-48">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <p className="text-xs font-bold text-brand-500 uppercase tracking-wider">
            Heritage Institute of Technology
          </p>

          <h1 className="text-xl font-black text-slate-800 mt-0.5">
            🍽️ Smart Canteen
          </h1>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Crowd Meter */}
      <div className="px-5 mb-5">
        <CrowdMeter />
      </div>

      {/* Menu */}
      <div className="px-5">
        <SectionHeader
          title="Today's Menu"
          subtitle="Fresh & made to order"
        />

        <MenuGrid
          items={menuItems}
          isLoading={menuLoading}
          cart={cart}
          onAdd={onAdd}
          onUpdateQty={onUpdateQty}
        />
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onUpdateQty={onUpdateQty}
        onCheckout={onCheckout}
      />
    </div>
  );
}