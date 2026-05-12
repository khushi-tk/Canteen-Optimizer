/**
 * src/App.tsx
 */

import { useState } from 'react';

import { useAuth } from './context/AuthContext';
import { useMenu } from './hooks/useMenu';
import { useCart } from './hooks/useCart';

import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';

import { HomeView } from './components/HomeView';
import { CheckoutSummary } from './components/Checkout/CheckoutSummary';
import { OrderTokenScreen } from './components/OrderToken/OrderTokenScreen';

import { Spinner } from './components/ui';
import type { TimeSlot } from './types';

/* Shared demo slots — used by both CartDrawer and CheckoutSummary */
const DEMO_SLOTS: TimeSlot[] = [
  {
    id: '1',
    label: '1:00 PM – 1:15 PM',
    startTime: '1:00 PM',
    endTime: '1:15 PM',
    spotsRemaining: 8,
    available: true,
  },
  {
    id: '2',
    label: '1:15 PM – 1:30 PM',
    startTime: '1:15 PM',
    endTime: '1:30 PM',
    spotsRemaining: 4,
    available: true,
  },
  {
    id: '3',
    label: '1:30 PM – 1:45 PM',
    startTime: '1:30 PM',
    endTime: '1:45 PM',
    spotsRemaining: 1,
    available: true,
  },
  {
    id: '4',
    label: '1:45 PM – 2:00 PM',
    startTime: '1:45 PM',
    endTime: '2:00 PM',
    spotsRemaining: 0,
    available: false,
  },
];

export default function App() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { items: menuItems, isLoading: menuLoading } = useMenu();
  const { cart, cartCount, cartTotal, addItem, updateQty } = useCart();

  const [view, setView] = useState<'home' | 'checkout' | 'token'>('home');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [orderToken, setOrderToken] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  /* ── Order Token / QR Screen ─────────────────────────────── */
  if (view === 'token' && orderToken) {
    return (
      <OrderTokenScreen
        token={orderToken}
        onDone={() => {
          setView('home');
          setOrderToken(null);
          setSelectedSlotId(null);
        }}
      />
    );
  }

  /* ── Checkout Summary ───────────────────────────────────── */
  if (view === 'checkout') {
    return (
      <CheckoutSummary
        cart={cart}
        cartTotal={cartTotal}
        slots={DEMO_SLOTS}
        slotsLoading={false}
        selectedSlotId={selectedSlotId}
        selectSlot={setSelectedSlotId}
        isPlacingOrder={false}
        orderError={null}
        onPlaceOrder={() => {
          const slot = DEMO_SLOTS.find((s) => s.id === selectedSlotId);
          setOrderToken({
            tokenCode: 'A102',
            qrPayload: 'demo-order',
            estimatedReadyAt: new Date(
              Date.now() + 10 * 60 * 1000
            ).toISOString(),
            pickupSlot: slot
              ? { id: slot.id, label: slot.label }
              : { id: null, label: 'Walk-in' },
            status: 'confirmed',
            items: cart,
            totalAmount: cartTotal,
          });
          setView('token');
        }}
        onBack={() => setView('home')}
      />
    );
  }

  /* ── Student Home (Menu + CartDrawer) ───────────────────── */
  return (
    <HomeView
      menuItems={menuItems}
      menuLoading={menuLoading}
      cart={cart}
      cartCount={cartCount}
      cartTotal={cartTotal}
      onAdd={addItem}
      onUpdateQty={updateQty}
      onCheckout={(slotId) => {
        setSelectedSlotId(slotId);
        setView('checkout');
      }}
    />
  );
}