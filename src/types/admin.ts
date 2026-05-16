/**
 * types/admin.ts
 *
 * Extended types for admin functionality and crowd data management.
 */

import type { MenuItem } from './index';

/* ── User Roles ────────────────────────────────────────────── */

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

/* ── Auth ──────────────────────────────────────────────────── */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/* ── Orders (Admin View) ──────────────────────────────────── */

export type OrderStatus = 'pending_payment' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  studentName: string;
  studentEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  timeSlot: string;
  pickupTime: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

/* ── Crowd Data (Shared) ─────────────────────────────────── */

export interface CrowdData {
  currentLevel: CrowdLevel;
  estimatedWaitMinutes: number;
  preparingOrderCount: number;
  staffOnDuty: number;
  capacityPercentage: number;
  lastUpdatedAt: string;
  manualOverride: boolean;
  overrideReason?: string;
}

export type CrowdLevel = 'low' | 'medium' | 'high';

/* ── Admin Dashboard Stats ────────────────────────────────── */

export interface DashboardStats {
  activeOrders: number;
  pendingOrders: number;
  readyForPickup: number;
  completedToday: number;
  avgPrepTime: number;
  revenueToday: number;
}