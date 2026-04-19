/**
 * components/HomeView.tsx
 *
 * The main home screen that combines the CrowdMeter and MenuGrid
 * together in a scrollable view.  Owns no state — everything is
 * received via props from App.tsx.
 *
 * Props:
 *   menu hook values + cart drawer props
 */

import type { CartItem, MenuItem } from '../types';
import { CrowdMeter } from './CrowdMeter/CrowdMeter';
import { MenuGrid } from './Menu/MenuGrid';
import { CartDrawer } from './Menu/CartDrawer';
import { SectionHeader } from './ui';

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
  return (
    <div className="pb-48">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-xs font-bold text-brand-500 uppercase tracking-wider">
          Heritage Institute of Technology
        </p>
        <h1 className="text-xl font-black text-slate-800 mt-0.5">
          🍽️ Smart Canteen
        </h1>
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
