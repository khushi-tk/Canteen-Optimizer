/**
 * src/App.tsx
 *
 * Root student / admin router with full navigation state machine.
 * Student flow: Home ↔ My Orders → Checkout → Confirmation
 * Includes one-click reorder: My Orders → (populate cart) → Checkout
 */

import { useState, useCallback } from 'react';
import type { AppView, OrderToken } from './types';
import { useAuth } from './context/AuthContext';
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

export default function App() {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const { items: menuItems, isLoading: menuLoading } = useMenu();
  const { cart, cartCount, cartTotal, addItem, updateQty, clearCart } = useCart();
  const { toast } = useToast();

  // Navigation state
  const [view, setView] = useState<AppView>('home');

  // Order / checkout flow
  const {
    slots,
    slotsLoading,
    selectedSlotId,
    selectSlot,
    orderToken,
    isPlacingOrder,
    orderError,
    submitOrder,
    resetOrder,
  } = useOrder();

  // Confirmed token (for the confirmation screen)
  const [confirmedToken, setConfirmedToken] = useState<OrderToken | null>(null);

  // Active order count for BottomNav badge (simple: 0 since we don't persist)
  const [activeOrderCount] = useState(0);

  // ── Reorder hook ──────────────────────────────────────────
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
          `${result.unavailable.join(', ')} ${result.unavailable.length > 1 ? 'are' : 'is'} no longer available.`,
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

  // ── Checkout handlers ─────────────────────────────────────
  const handleProceedToCheckout = useCallback(() => {
    setView('checkout');
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (!user) return;
    await submitOrder(cart, cartTotal, user.id);
  }, [user, cart, cartTotal, submitOrder]);

  // When orderToken is set (order placed successfully), go to confirmation
  const handleGoToConfirmation = useCallback(() => {
    if (orderToken) {
      setConfirmedToken(orderToken);
      clearCart();
      resetOrder();
      setView('confirmation');
    }
  }, [orderToken, clearCart, resetOrder]);

  // Watch for orderToken changes to auto-navigate
  if (orderToken && view === 'checkout') {
    // Schedule navigation for next render to avoid setState during render
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

  // ── Loading state ─────────────────────────────────────────
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

  // ── Admin route ─────────────────────────────────────────
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // ── Student route ───────────────────────────────────────
  return (
    <div className="mx-auto max-w-[390px] min-h-screen bg-slate-50">
      {/* Checkout screen */}
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

      {/* Confirmation screen */}
      {view === 'confirmation' && confirmedToken && (
        <OrderTokenScreen
          token={confirmedToken}
          onDone={handleDoneFromConfirmation}
        />
      )}

      {/* Home (Menu) view */}
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

      {/* My Orders view */}
      {view === 'my-orders' && (
        <MyOrdersView
          onViewQR={handleViewQR}
          onReorder={handleReorder}
        />
      )}

      {/* Bottom navigation */}
      <BottomNav
        currentView={view}
        activeOrderCount={activeOrderCount}
        onNavigate={setView}
      />
    </div>
  );
}