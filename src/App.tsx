/**
 * src/App.tsx
 */

//import { useAuth } from './hooks/useAuth';
import { useAuth } from './context/AuthContext';
import { useMenu } from './hooks/useMenu';
import { useCart } from './hooks/useCart';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { HomeView } from './components/HomeView';
import { Spinner } from './components/ui';

export default function App() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { items: menuItems, isLoading: menuLoading } = useMenu();
  const { cart, cartCount, cartTotal, addItem, updateQty, checkout } = useCart();

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

  // ── Admin route ─────────────────────────────
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // ── Student route ───────────────────────────
  return (
    <HomeView
      menuItems={menuItems}
      menuLoading={menuLoading}
      cart={cart}
      cartCount={cartCount}
      cartTotal={cartTotal}
      onAdd={addItem}
      onUpdateQty={updateQty}
      onCheckout={checkout}
    />
  );
}