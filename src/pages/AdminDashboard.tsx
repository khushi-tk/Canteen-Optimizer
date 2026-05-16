/**
 * pages/AdminDashboard.tsx
 */

import { useState } from 'react';
import { AdminLayout } from '../components/Admin/AdminLayout';
import { OrderQueue } from '../components/Admin/OrderQueue';
import { CrowdControlPanel } from '../components/Admin/CrowdControlPanel';
import { AnalyticsDashboard } from '../components/Admin/AnalyticsDashboard';
import { MenuManagement } from '../components/Admin/MenuManagement';
import { InventoryPanel } from '../components/Admin/InventoryPanel';
import { useAdminOrders } from '../hooks/useAdminOrders';
//import { useAuth } from '../hooks/useAuth';
import { useAuth } from '../context/AuthContext';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'crowd' | 'menu' | 'analytics' | 'inventory'>('orders');
  const { orders, stats, isLoading, updateStatus, cancelOrder } = useAdminOrders();
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">Access Denied</h2>
          <p className="mt-1 text-sm text-slate-500">This area is restricted to canteen staff.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'orders' && (
        <OrderQueue
          orders={orders}
          stats={stats}
          isLoading={isLoading}
          onUpdateStatus={updateStatus}
          onCancel={cancelOrder}
        />
      )}
      {activeTab === 'crowd' && <CrowdControlPanel />}
      {activeTab === 'menu' && <MenuManagement />}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard orders={orders} stats={stats} />
      )}
      {activeTab === 'inventory' && <InventoryPanel />}
    </AdminLayout>
  );
}