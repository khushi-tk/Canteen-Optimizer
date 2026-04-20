/**
 * App.tsx
 *
 * Root application component.  Implements a simple view state-machine
 * (no react-router):
 *
 *   home → checkout → confirmation → home (on Done)
 *   home ↔ my-orders (via BottomNav)
 *   my-orders → confirmation (view QR of existing order)
 *
 * Owns: currentView, qrTokenViewing, and orchestrates hooks
 * (useMenu, useOrder) to wire everything together.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppView, OrderToken } from './types';
import { useMenu } from './hooks/useMenu';
import { useOrder } from './hooks/useOrder';
import { useToast } from './hooks/useToast';
import { HomeView } from './components/HomeView';
import { CheckoutSummary } from './components/Checkout/CheckoutSummary';
import { OrderTokenScreen } from './components/OrderToken/OrderTokenScreen';
import { MyOrdersView } from './components/MyOrders/MyOrdersView';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [qrTokenViewing, setQrTokenViewing] = useState<OrderToken | null>(null);
  const { toast } = useToast();

  const menu = useMenu();
  const order = useOrder();

  /* Navigate to confirmation when order is placed */
  useEffect(() => {
    if (order.orderToken) {
      setCurrentView('confirmation');
      toast.success('Order placed successfully!', `Token: ${order.orderToken.tokenCode}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.orderToken]);

  /* Show toast on order error */
  useEffect(() => {
    if (order.orderError) {
      toast.error('Order failed', order.orderError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.orderError]);

  /* Checkout handler */
  const handleCheckout = useCallback(() => {
    if (menu.cartCount === 0) {
      toast.warning('Cart is empty', 'Add items before checking out.');
      return;
    }
    setCurrentView('checkout');
  }, [menu.cartCount, toast]);

  /* Place order handler */
  const handlePlaceOrder = useCallback(() => {
    void order.submitOrder(menu.cart, menu.cartTotal, 'student-001');
  }, [order, menu.cart, menu.cartTotal]);

  /* Done from confirmation */
  const handleDone = useCallback(() => {
    menu.clearCart();
    order.resetOrder();
    setQrTokenViewing(null);
    setCurrentView('home');
  }, [menu, order]);

  /* View QR of existing order */
  const handleViewQR = useCallback((token: OrderToken) => {
    setQrTokenViewing(token);
    setCurrentView('confirmation');
  }, []);

  /* Navigation */
  const handleNavigate = useCallback((view: AppView) => {
    setCurrentView(view);
  }, []);

  /* Active order count — for BottomNav badge */
  const activeOrderCount = useMemo(() => {
    // Count from order token if exists
    return order.orderToken ? 1 : 0;
  }, [order.orderToken]);

  /* Resolve which token to show on confirmation view */
  const confirmationToken = qrTokenViewing ?? order.orderToken;

  return (
    <div className="mx-auto min-h-screen w-full max-w-[390px] bg-slate-50 relative shadow-xl">
      {/* Animated view */}
      <div key={currentView} className="animate-fadeIn">
        {currentView === 'home' && (
          <HomeView
            menuItems={menu.items}
            menuLoading={menu.isLoading}
            cart={menu.cart}
            cartCount={menu.cartCount}
            cartTotal={menu.cartTotal}
            onAdd={menu.addToCart}
            onUpdateQty={menu.updateQuantity}
            onCheckout={handleCheckout}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutSummary
            cart={menu.cart}
            cartTotal={menu.cartTotal}
            slots={order.slots}
            slotsLoading={order.slotsLoading}
            selectedSlotId={order.selectedSlotId}
            selectSlot={order.selectSlot}
            isPlacingOrder={order.isPlacingOrder}
            orderError={order.orderError}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'confirmation' && confirmationToken && (
          <OrderTokenScreen token={confirmationToken} onDone={handleDone} />
        )}

        {currentView === 'my-orders' && (
          <MyOrdersView onViewQR={handleViewQR} />
        )}
      </div>

      {/* Bottom navigation */}
      <BottomNav
        currentView={currentView}
        activeOrderCount={activeOrderCount}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
