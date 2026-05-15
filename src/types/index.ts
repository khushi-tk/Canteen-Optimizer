/**
 * types/index.ts
 *
 * Core types for CanteenCrowd — student, admin, and shared.
 */

/* ── Menu & Cart ─────────────────────────────────────────── */

export type DietaryTag = 'veg' | 'non-veg' | 'vegan' | 'contains-egg';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  dietaryTag: DietaryTag;
  category: string;
  description: string;
  prepTimeMinutes: number;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

/* ── Time Slots ──────────────────────────────────────────── */

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  spotsRemaining: number;
  available: boolean;
}

/* ── Crowd (Student View) ────────────────────────────────── */

export type CrowdLevel = 'low' | 'medium' | 'high';

export interface CrowdStatus {
  level: CrowdLevel;
  estimatedWaitMinutes: number;
  preparingOrderCount: number;
  staffOnDuty: number;
  lastUpdatedAt: string;
  manualOverride: boolean;
}

/* ── Auth & Users ────────────────────────────────────────── */

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/* ── Orders ──────────────────────────────────────────────── */

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'cancelled';

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

/* ── Crowd Data (Admin Write) ────────────────────────────── */

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

/* ── App Navigation ──────────────────────────────────────── */

export type AppView = 'home' | 'checkout' | 'confirmation' | 'my-orders';

/* ── Order Token (Confirmation) ─────────────────────────── */

export interface OrderToken {
  orderId: string;
  tokenCode: string;
  qrPayload: string;
  status: OrderStatus;
  pickupSlot: TimeSlot;
  items: CartItem[];
  totalAmount: number;
  placedAt: string;
  estimatedReadyAt: string;
  studentName?: string;
  studentEmail?: string;
}

/* ── API Types ───────────────────────────────────────────── */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface OrderRequest {
  items: { menuItemId: string; quantity: number }[];
  cart: CartItem[];
  totalAmount: number;
  slotId: string;
  userId: string;
  userName: string;
  userEmail: string;
}