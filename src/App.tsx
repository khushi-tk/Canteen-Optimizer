/**
 * src/App.tsx
 *
 * Root student / admin router with full navigation state machine.
 * Student flow: Home ↔ My Orders → Checkout → Confirmation
 * Includes one-click reorder: My Orders → (populate cart) → Checkout
 */

import { useState, useCallback } from 'react';

import type { AppView, OrderToken, TimeSlot } from './types';

import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useMenu } from './hooks/useMenu';
import { useCart } from './hooks/useCart';
import { useOrder } from './hooks/useOrder';
import { useReorder } from './hooks/useReorder';
import { useToast } from './hooks/useToast';

import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';

import { HomeView } from './components/HomeView';
import { BottomNav } from './components/BottomNav';
import { MyOrdersView } from './components/MyOrders/MyOrdersView';
import { CheckoutSummary } from './components/Checkout/CheckoutSummary';
import { OrderTokenScreen } from './components/OrderToken/OrderTokenScreen';

import { Spinner } from './components/ui';

/* Shared demo slots fallback */
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
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const { items: menuItems, isLoading: menuLoading } = useMenu();

  const {
    cart,
    cartCount,
    cartTotal,
    addItem,
    updateQty,
    clearCart,
  } = useCart();

  const { toast } = useToast();

  /* ── Navigation State ───────────────────────────────────── */
  const [view, setView] = useState<AppView>('home');

  /* ── Order / Checkout Flow ─────────────────────────────── */
  const {
    slots = DEMO_SLOTS,
    slotsLoading,
    selectedSlotId,
    selectSlot,
    orderToken,
    isPlacingOrder,
    orderError,
    submitOrder,
    resetOrder,
  } = useOrder();

  /* ── Confirmation Screen State ─────────────────────────── */
  const [confirmedToken, setConfirmedToken] =
    useState<OrderToken | null>(null);

  /* ── Active Orders Badge ───────────────────────────────── */
  const [activeOrderCount] = useState(0);

  /* ── Reorder Hook ──────────────────────────────────────── */
  const navigateToCheckout = useCallback(() => {
    setView('checkout');
  }, []);

  const { reorder } = useReorder({
    menuItems,
    clearCart,
    addItem,
    navigateToCheckout,
  });

  const handleReorder = useCallback(
    (order: OrderToken) => {
      const result = reorder(order);

      if (result.added === 0) {
        toast.error(
          'Cannot reorder',
          'None of the items are available anymore.',
        );
        return;
      }

      if (result.unavailable.length > 0) {
        toast.warning(
          `Added ${result.added} item${result.added > 1 ? 's' : ''} to cart`,
          `${result.unavailable.join(', ')} ${result.unavailable.length > 1 ? 'are' : 'is'
          } no longer available.`,
        );
      } else {
        toast.success(
          `Added ${result.added} item${result.added > 1 ? 's' : ''} to cart`,
          'Pick a time slot to complete your order.',
        );
      }
    },
    [reorder, toast],
  );

  /* ── Checkout Handlers ─────────────────────────────────── */
  const handleProceedToCheckout = useCallback(() => {
    setView('checkout');
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (!user) return;

    await submitOrder(cart, cartTotal, user.id, user.name, user.email);
  }, [user, cart, cartTotal, submitOrder]);

  const handleGoToConfirmation = useCallback(() => {
    if (orderToken) {
      setConfirmedToken(orderToken);

      clearCart();
      resetOrder();

      setView('confirmation');
    }
  }, [orderToken, clearCart, resetOrder]);

  /* Auto transition after successful order */
  if (orderToken && view === 'checkout') {
    setTimeout(() => handleGoToConfirmation(), 0);
  }

  const handleBackFromCheckout = useCallback(() => {
    setView('home');
  }, []);

  const handleDoneFromConfirmation = useCallback(() => {
    setConfirmedToken(null);
    setView('home');
  }, []);

  const handleViewQR = useCallback((token: OrderToken) => {
    setConfirmedToken(token);
    setView('confirmation');
  }, []);

  /* ── Loading ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Spinner size="lg" />
      </div>
    );
  }

  /* ── Auth Gate ─────────────────────────────────────────── */
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  /* ── Admin Route ───────────────────────────────────────── */
  if (isAdmin) {
    return <AdminDashboard />;
  }

  /* ── Student Route ────────────────────────────────────── */
  return (
    <div className="mx-auto min-h-screen max-w-[390px] sm:max-w-none bg-slate-50 dark:bg-slate-900">

      {/* Theme Toggle — fixed top-right */}
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="fixed right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700"
      >
        {isDark ? (
          /* Sun icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm10-7a1 1 0 010 2h-1a1 1 0 110-2h1zM3 11a1 1 0 010 2H2a1 1 0 110-2h1zm15.364-6.364a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM7.757 16.243a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zm9.9 1.414a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM7.757 7.757a1 1 0 01-1.414 0l-.707-.707A1 1 0 017.05 5.636l.707.707a1 1 0 010 1.414zM12 7a5 5 0 100 10A5 5 0 0012 7z" />
          </svg>
        ) : (
          /* Moon icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
        )}
      </button>

      {/* Checkout */}
      {view === 'checkout' && (
        <CheckoutSummary
          cart={cart}
          cartTotal={cartTotal}
          slots={slots}
          slotsLoading={slotsLoading}
          selectedSlotId={selectedSlotId}
          selectSlot={selectSlot}
          isPlacingOrder={isPlacingOrder}
          orderError={orderError}
          onPlaceOrder={handlePlaceOrder}
          onBack={handleBackFromCheckout}
        />
      )}

      {/* Confirmation */}
      {view === 'confirmation' && confirmedToken && (
        <OrderTokenScreen
          token={confirmedToken}
          onDone={handleDoneFromConfirmation}
        />
      )}

      {/* Home */}
      {view === 'home' && (
        <HomeView
          menuItems={menuItems}
          menuLoading={menuLoading}
          cart={cart}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onAdd={addItem}
          onUpdateQty={updateQty}
          onCheckout={handleProceedToCheckout}
        />
      )}

      {/* My Orders */}
      {view === 'my-orders' && (
        <MyOrdersView
          onViewQR={handleViewQR}
          onReorder={handleReorder}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        currentView={view}
        activeOrderCount={activeOrderCount}
        onNavigate={setView}
      />
    </div>
  );
}